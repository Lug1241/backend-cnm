import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import { hash, genSalt } from 'bcryptjs';
import {
  type IRepresentanteRepository,
  I_REPRESENTANTE_REPOSITORY,
} from '@domain/interfaces/representante.repository.interface';
import { Representante } from '@domain/entities/representante.entity';
import { CreateRepresentanteDto } from '../dtos/create-representante.dto';
import { UpdateRepresentanteDto } from '../dtos/update-representante.dto';
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

  private generarPasswordFuerte(): string {
    const mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const minusculas = 'abcdefghijklmnopqrstuvwxyz';
    const numeros = '0123456789';
    const especiales = '!@#$%^&*()_+-=';
    const todos = mayusculas + minusculas + numeros + especiales;

    const obtenerCaracter = (caracteres: string): string =>
      caracteres[randomInt(caracteres.length)];

    const password = [
      obtenerCaracter(mayusculas),
      obtenerCaracter(minusculas),
      obtenerCaracter(numeros),
      obtenerCaracter(especiales),
    ];

    while (password.length < 8) {
      password.push(obtenerCaracter(todos));
    }

    for (let i = password.length - 1; i > 0; i--) {
      const posicion = randomInt(i + 1);
      [password[i], password[posicion]] = [password[posicion], password[i]];
    }

    return password.join('');
  }

  private ocultarDatosSensibles(representante: Representante) {
    const {
      password: _password,
      resetToken: _resetToken,
      resetTokenExpires: _resetTokenExpires,
      ...resultado
    } = representante;

    return resultado;
  }

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

    const passwordProvisional = this.generarPasswordFuerte();
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

    return this.ocultarDatosSensibles(representanteGuardado);
  }

  async update(nroCedula: string, dto: UpdateRepresentanteDto) {
    const representanteActual =
      await this.representanteRepository.findByCedula(nroCedula);

    if (!representanteActual) {
      throw new NotFoundException('Representante no encontrado');
    }

    let cedulaActualizada = nroCedula;

    if (dto.nroCedula && dto.nroCedula !== nroCedula) {
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

      passwordProvisional = this.generarPasswordFuerte();

      const salt = await genSalt(10);
      datosAActualizar.password = await hash(passwordProvisional, salt);
      datosAActualizar.debeCambiarPassword = true;
    }

    const actualizado = await this.representanteRepository.update(
      nroCedula,
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

    return this.ocultarDatosSensibles(representanteActualizado);
  }

  async getByCedula(nroCedula: string) {
    const representante =
      await this.representanteRepository.findByCedula(nroCedula);

    if (!representante) {
      throw new NotFoundException('Representante no encontrado');
    }

    return this.ocultarDatosSensibles(representante);
  }

  async getAll(page: number, limit: number, search: string) {
    const { data, totalRows } = await this.representanteRepository.findAll(
      page,
      limit,
      search,
    );

    return {
      data: data.map((representante) =>
        this.ocultarDatosSensibles(representante),
      ),
      totalPages: Math.ceil(totalRows / limit),
      currentPage: page,
      totalRows,
    };
  }

  async delete(nroCedula: string) {
    const representante =
      await this.representanteRepository.findByCedula(nroCedula);

    if (!representante) {
      throw new NotFoundException('Representante no encontrado');
    }

    await this.representanteRepository.delete(nroCedula);

    return this.ocultarDatosSensibles(representante);
  }
}
