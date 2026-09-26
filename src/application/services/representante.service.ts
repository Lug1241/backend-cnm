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
import { CreateRepresentanteDto } from '../dtos/representante/create-representante.dto';
import { UpdateRepresentanteDto } from '../dtos/representante/update-representante.dto';
import {
  ocultarDatosSensibles,
  generarPasswordFuerte,
} from '@infrastructure/utils/security.utils';
import {
  type IMailService,
  I_MAIL_SERVICE,
} from '@domain/interfaces/mail.service.interface';
import {
  type IPeriodoAcademicoRepository,
  I_PERIODO_REPOSITORY,
} from '@domain/interfaces/periodo-academico.repository.interface';

@Injectable()
export class RepresentanteService {
  constructor(
    @Inject(I_REPRESENTANTE_REPOSITORY)
    private readonly representanteRepository: IRepresentanteRepository,

    @Inject(I_MAIL_SERVICE)
    private readonly mailService: IMailService,

    @Inject(I_PERIODO_REPOSITORY)
    private readonly periodoRepository: IPeriodoAcademicoRepository,
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

  async update(nroCedula: string, dto: UpdateRepresentanteDto) {
    const representanteActual =
      await this.representanteRepository.findByCedula(nroCedula);

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

  async delete(nroCedula: string) {
    const representante =
      await this.representanteRepository.findByCedula(nroCedula);

    if (!representante) {
      throw new NotFoundException('Representante no encontrado');
    }

    await this.representanteRepository.delete(nroCedula);

    return ocultarDatosSensibles(representante);
  }

  async verificarDocumentosActualizados(nroCedula: string) {
    const representante = await this.getByCedula(nroCedula);
    const periodoActivo = await this.periodoRepository.findActive();

    if (!periodoActivo) {
      throw new NotFoundException({
        message: 'No hay un período académico activo',
        datosActualizados: false,
      });
    }

    const anioLectivo = periodoActivo.descripcion
      .trim()
      .replace(/^per[ií]odo\s*/i, '')
      .trim()
      .toLowerCase();

    const extraerNombre = (ruta: string | null | undefined) =>
      ruta?.trim().replace(/\\/g, '/').split('/').pop()?.toLowerCase();

    const cedulaValida = Boolean(
      anioLectivo &&
        extraerNombre(representante.cedulaPdf)?.endsWith(`_${anioLectivo}.pdf`),
    );

    const croquisValido = Boolean(
      anioLectivo &&
        extraerNombre(representante.croquisPdf)?.endsWith(`_${anioLectivo}.pdf`),
    );

    const faltantes: string[] = [];
    if (!cedulaValida) faltantes.push('Copia de cédula');
    if (!croquisValido) faltantes.push('Croquis de domicilio');

    const datosActualizados = cedulaValida && croquisValido;

    return {
      datosActualizados,
      message: datosActualizados
        ? 'El representante tiene los documentos actualizados'
        : 'El representante debe actualizar sus documentos (cédula y croquis) para el período activo antes de continuar',
      faltantes,
    };
  }
}
