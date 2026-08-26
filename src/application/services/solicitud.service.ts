import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  I_SOLICITUD_REPOSITORY,
  type ISolicitudRepository,
} from '../../domain/interfaces/solicitud.repository.interface';
import {
  EstadoSolicitud,
  Solicitud,
} from '../../domain/entities/solicitud.entity';
import { CreateSolicitudDto } from '../dtos/create-solicitud.dto';
import { UpdateSolicitudDto } from '../dtos/update-solicitud.dto';

@Injectable()
export class SolicitudService {
  constructor(
    @Inject(I_SOLICITUD_REPOSITORY)
    private readonly solicitudRepository: ISolicitudRepository,
  ) {}

  async create(dto: CreateSolicitudDto): Promise<Solicitud> {
    const fechaInicio = dto.fechaInicio ?? null;
    const fechaFin = dto.fechaFin ?? null;

    this.validateDateRange(fechaInicio, fechaFin);

    const existe = await this.solicitudRepository.findDuplicate({
      ID_docente: dto.ID_docente,
      fechaInicio,
      fechaFin,
      motivo: dto.motivo,
      descripcion: dto.descripcion,
    });

    if (existe) {
      throw new ConflictException(
        'Esta solicitud ya fue hecha para ese rango y sección',
      );
    }

    const nuevaSolicitud = new Solicitud({
      ...dto,
      fechaInicio,
      fechaFin,
      estado: EstadoSolicitud.PENDIENTE,
    });

    return this.solicitudRepository.create(nuevaSolicitud);
  }

  async update(id: number, dto: UpdateSolicitudDto): Promise<Solicitud> {
    const solicitudActual = await this.solicitudRepository.findById(id);
    if (!solicitudActual) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    const fechaInicio =
      dto.fechaInicio === undefined
        ? solicitudActual.fechaInicio
        : dto.fechaInicio;
    const fechaFin =
      dto.fechaFin === undefined ? solicitudActual.fechaFin : dto.fechaFin;

    this.validateDateRange(fechaInicio, fechaFin);

    await this.solicitudRepository.update(id, dto);
    const actualizada = await this.solicitudRepository.findById(id);

    return actualizada!;
  }

  async getByDocente(nroCedulaDocente: string): Promise<Solicitud[]> {
    return this.solicitudRepository.findByDocente(nroCedulaDocente);
  }

  async getAll(): Promise<Solicitud[]> {
    return this.solicitudRepository.findAll();
  }

  async getLastAcceptedByDocente(nroCedulaDocente: string): Promise<Solicitud> {
    const solicitud =
      await this.solicitudRepository.findLastAcceptedByDocente(
        nroCedulaDocente,
      );

    if (!solicitud) {
      throw new NotFoundException('No se encontró ninguna solicitud');
    }

    return solicitud;
  }

  async delete(id: number): Promise<Solicitud> {
    const solicitud = await this.solicitudRepository.findById(id);
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    await this.solicitudRepository.delete(id);
    return solicitud;
  }

  private validateDateRange(
    fechaInicio: Date | null,
    fechaFin: Date | null,
  ): void {
    if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser posterior a la fecha de fin',
      );
    }
  }
}
