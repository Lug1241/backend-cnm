import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { hash, genSalt } from 'bcryptjs';
import {
  type IDocenteRepository,
  I_DOCENTE_REPOSITORY,
} from '@domain/interfaces/docente.repository.interface';
import { Docente } from '@domain/entities/docente.entity';
import { CreateDocenteDto } from '../dtos/create-docente.dto';
import { UpdateDocenteDto } from '../dtos/update-docente.dto';
import {
  generarPasswordFuerte,
  ocultarDatosSensibles,
} from '@infrastructure/utils/security.utils';
import {
  type IMailService,
  I_MAIL_SERVICE,
} from '@domain/interfaces/mail.service.interface';

@Injectable()
export class DocenteService {
  constructor(
    @Inject(I_DOCENTE_REPOSITORY)
    private readonly docenteRepository: IDocenteRepository,

    @Inject(I_MAIL_SERVICE)
    private readonly mailService: IMailService,
  ) {}

  async create(dto: CreateDocenteDto) {
    const docenteExistente = await this.docenteRepository.findByCedula(
      dto.nroCedula,
    );

    if (docenteExistente) {
      throw new ConflictException('La cédula ya existe');
    }

    const emailExistente = await this.docenteRepository.findByEmail(dto.email);

    if (emailExistente) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordProvisional = generarPasswordFuerte();
    const salt = await genSalt(10);
    const hashedPassword = await hash(passwordProvisional, salt);

    const nuevoDocente = new Docente({
      ...dto,
      password: hashedPassword,
      debeCambiarPassword: true,
      habilitado: false,
    });

    const docenteGuardado = await this.docenteRepository.create(nuevoDocente);

    await this.mailService.enviarContrasenia(dto.email, passwordProvisional);

    return ocultarDatosSensibles(docenteGuardado);
  }

  async update(nroCedula: string, dto: UpdateDocenteDto) {
    const docenteActual = await this.docenteRepository.findByCedula(nroCedula);

    if (!docenteActual) {
      throw new NotFoundException('Docente no encontrado');
    }

    const datosAActualizar: Partial<Docente> = { ...dto };
    let passwordProvisional: string | null = null;

    if (dto.password) {
      const salt = await genSalt(10);
      datosAActualizar.password = await hash(dto.password, salt);
    }

    if (dto.email && dto.email !== docenteActual.email) {
      const emailEnUso = await this.docenteRepository.findByEmail(dto.email);

      if (emailEnUso) {
        throw new ConflictException(
          'El nuevo email ya está registrado por otro docente',
        );
      }

      if (!dto.password) {
        passwordProvisional = generarPasswordFuerte();

        const salt = await genSalt(10);
        datosAActualizar.password = await hash(passwordProvisional, salt);
        datosAActualizar.debeCambiarPassword = true;
      }
    }

    await this.docenteRepository.update(nroCedula, datosAActualizar);

    if (passwordProvisional && dto.email) {
      await this.mailService.enviarContrasenia(dto.email, passwordProvisional);
    }

    const docenteActualizado =
      await this.docenteRepository.findByCedula(nroCedula);

    if (!docenteActualizado) {
      throw new NotFoundException('Docente actualizado no encontrado');
    }

    return ocultarDatosSensibles(docenteActualizado);
  }

  async getByID(id: number) {
    const docente = await this.docenteRepository.findByID(id);
    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    return ocultarDatosSensibles(docente);
  }

  async getByCedula(nroCedula: string) {
    const docente = await this.docenteRepository.findByCedula(nroCedula);

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    return ocultarDatosSensibles(docente);
  }

  async getAll(page: number, limit: number, search: string) {
    const { data, totalRows } = await this.docenteRepository.findAll(
      page,
      limit,
      search,
    );

    return {
      data: data.map((docente) => ocultarDatosSensibles(docente)),
      totalPages: Math.ceil(totalRows / limit),
      currentPage: page,
      totalRows,
    };
  }

  async delete(nroCedula: string) {
    const docente = await this.docenteRepository.findByCedula(nroCedula);

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    await this.docenteRepository.delete(nroCedula);

    return ocultarDatosSensibles(docente);
  }
}
