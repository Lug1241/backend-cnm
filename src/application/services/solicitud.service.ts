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
import { I_DOCENTE_REPOSITORY,
  type IDocenteRepository
 } from '@domain/interfaces/docente.repository.interface';
import { CreateSolicitudDto } from '../dtos/solicitud/create-solicitud.dto';
import { UpdateSolicitudDto } from '../dtos/solicitud/update-solicitud.dto';
import { notDeepEqual } from 'assert';

@Injectable()
export class SolicitudService {
  constructor(
    @Inject(I_SOLICITUD_REPOSITORY)
    private readonly solicitudRepository: ISolicitudRepository,
    
    @Inject(I_DOCENTE_REPOSITORY)
    private readonly docenteRepository: IDocenteRepository,
  ) {}

  async create(dto: CreateSolicitudDto): Promise<Solicitud> {
    const docente = await this.docenteRepository.findByCedula(dto.cedula);

    if (!docente) {
      throw new NotFoundException('No se encontró un docente asociado a esta cédula.');
    }

    if (docente.id === undefined) {
      throw new NotFoundException('El docente no tiene un identificador válido.');
    }

    const fechaInicio = dto.fechaInicio ?? null;
    const fechaFin = dto.fechaFin ?? null;

    this.validateDateRange(fechaInicio, fechaFin);

    const existe = await this.solicitudRepository.findDuplicate({
      ID_docente: docente.id,
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
      motivo: dto.motivo,
      descripcion: dto.descripcion,
      fechaSolicitud: dto.fechaSolicitud,
      docente: docente,
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
  
  async getAll(): Promise<Solicitud[]> {
    return this.solicitudRepository.findAll();
  }
  
  async getByConditions(id?: number, cedula?: string, fechaInicio?: string, fechaFin?: string): Promise<Solicitud[]> {
    const solicitudes = await this.solicitudRepository.findByConditions(id, cedula, fechaInicio, fechaFin);

    if (!solicitudes || solicitudes.length === 0) {
      throw new NotFoundException('No se encontraron solicitudes para los criterios especificados.');
    }

    return solicitudes;
  }

  async getLastAcceptedByDocente(id?: number, cedula?: string): Promise<Solicitud> {
    const solicitud = await this.solicitudRepository.findLastAcceptedByDocente(id, cedula);

    if (!solicitud) {
      throw new NotFoundException('No se encontró ninguna solicitud aceptada para este docente.');
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
