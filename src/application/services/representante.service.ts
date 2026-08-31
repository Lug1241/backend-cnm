import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { hash, genSalt } from 'bcryptjs';
import {
  type IRepresentanteRepository,
  I_REPRESENTANTE_REPOSITORY,
} from '@domain/interfaces/representante.repository.interface';
import { Representante } from '@domain/entities/representante.entity';
import { CreateRepresentanteDto } from '../dtos/create-representante.dto';
import { UpdateRepresentanteDto } from '../dtos/update-representante.dto';
import {
  ocultarDatosSensibles,
  generarPasswordFuerte,
} from '@infrastructure/utils/security.utils';
import {
  type IMailService,
  I_MAIL_SERVICE,
} from '@domain/interfaces/mail.service.interface';

@Injectable()
export class RepresentanteService {
  constructor(
    @Inject(I_REPRESENTANTE_REPOSITORY)
    private readonly representanteRepository: IRepresentanteRepository,

    @Inject(I_MAIL_SERVICE)
    private readonly mailService: IMailService,
  ) {}

  async create(dto: CreateRepresentanteDto) {
    const representanteExistente =
      await this.representanteRepository.findByCedula(dto.nroCedula);

    if (representanteExistente) {
      throw new ConflictException('La cédula ya existe');
    }

    const emailExistente = await this.representanteRepository.findByEmail(
      dto.email,
    );

    if (emailExistente) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordProvisional = generarPasswordFuerte();
    const salt = await genSalt(10);
    const hashedPassword = await hash(passwordProvisional, salt);

    const nuevoRepresentante = new Representante({
      ...dto,
      convencional: dto.convencional ?? '',
      password: hashedPassword,
      debeCambiarPassword: true,
    });

    const representanteGuardado =
      await this.representanteRepository.create(nuevoRepresentante);

    await this.mailService.enviarContrasenia(dto.email, passwordProvisional);

    return ocultarDatosSensibles(representanteGuardado);
  }

  async update(ID: number, dto: UpdateRepresentanteDto) {
    const representanteActual = await this.representanteRepository.findByID(ID);

    if (!representanteActual) {
      throw new NotFoundException('Representante no encontrado');
    }

    let cedulaActualizada = representanteActual.nroCedula;

    if (dto.nroCedula && dto.nroCedula !== representanteActual.nroCedula) {
      const cedulaEnUso = await this.representanteRepository.findByCedula(
        dto.nroCedula,
      );

      if (cedulaEnUso) {
        throw new ConflictException(
          'La nueva cédula ya está registrada por otro representante',
        );
      }

      cedulaActualizada = dto.nroCedula;
    }
    const datosAActualizar: Partial<Representante> = { ...dto };
    let passwordProvisional: string | null = null;

    if (dto.password) {
      const salt = await genSalt(10);
      datosAActualizar.password = await hash(dto.password, salt);
    }

    if (dto.email && dto.email !== representanteActual.email) {
      const emailEnUso = await this.representanteRepository.findByEmail(
        dto.email,
      );

      if (emailEnUso) {
        throw new ConflictException(
          'El nuevo email ya está registrado por otro representante',
        );
      }

      if (!dto.password) {
        passwordProvisional = generarPasswordFuerte();

        const salt = await genSalt(10);
        datosAActualizar.password = await hash(passwordProvisional, salt);
        datosAActualizar.debeCambiarPassword = true;
      }
    }

    const actualizado = await this.representanteRepository.update(
      ID,
      datosAActualizar,
    );

    if (!actualizado) {
      throw new NotFoundException('No se pudo actualizar el representante');
    }

    if (passwordProvisional && dto.email) {
      await this.mailService.enviarContrasenia(dto.email, passwordProvisional);
    }

    const representanteActualizado =
      await this.representanteRepository.findByCedula(cedulaActualizada);

    if (!representanteActualizado) {
      throw new NotFoundException('Representante actualizado no encontrado');
    }

    return ocultarDatosSensibles(representanteActualizado);
  }

  async getByCedula(nroCedula: string) {
    const representante =
      await this.representanteRepository.findByCedula(nroCedula);

    if (!representante) {
      throw new NotFoundException('Representante no encontrado');
    }

    return ocultarDatosSensibles(representante);
  }

  async getAll(page: number, limit: number, search: string) {
    const { data, totalRows } = await this.representanteRepository.findAll(
      page,
      limit,
      search,
    );

    return {
      data: data.map((representante) => ocultarDatosSensibles(representante)),
      totalPages: Math.ceil(totalRows / limit),
      currentPage: page,
      totalRows,
    };
  }

  async delete(ID: number) {
    const representante = await this.representanteRepository.findByID(ID);

    if (!representante) {
      throw new NotFoundException('Representante no encontrado');
    }

    await this.representanteRepository.delete(ID);

    return ocultarDatosSensibles(representante);
  }
}
