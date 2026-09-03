import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import {
  ISolicitudRepository,
  SolicitudDuplicateCriteria,
} from '../../domain/interfaces/solicitud.repository.interface';
import {
  Solicitud,
  EstadoSolicitud,
} from '../../domain/entities/solicitud.entity';
import { SolicitudOrmEntity } from '../database/entitites/solicitud.orm-entity';
import { Docente } from '../../domain/entities/docente.entity';

@Injectable()
export class SolicitudRepository implements ISolicitudRepository {
  constructor(
    @InjectRepository(SolicitudOrmEntity)
    private readonly ormRepository: Repository<SolicitudOrmEntity>,
  ) {}

  private toDomain(ormEntity: SolicitudOrmEntity | null): Solicitud | null {
    if (!ormEntity) return null;

    return new Solicitud({
      id: ormEntity.id,
      descripcion: ormEntity.descripcion,
      fechaInicio: ormEntity.fechaInicio,
      fechaFin: ormEntity.fechaFin,
      motivo: ormEntity.motivo,
      estado: ormEntity.estado,
      fechaSolicitud: ormEntity.fechaSolicitud,
      docente: ormEntity.docente
        ? new Docente({
            nroCedula: ormEntity.docente.nroCedula,
            primerNombre: ormEntity.docente.primerNombre,
            primerApellido: ormEntity.docente.primerApellido,
          })
        : undefined,
    });
  }

  async create(solicitud: Solicitud): Promise<Solicitud> {
    const nueva = this.ormRepository.create(solicitud);
    const guardada = await this.ormRepository.save(nueva);

    // Para devolverla con los datos del docente (igual que hacía tu controlador antiguo)
    return this.findById(guardada.id) as Promise<Solicitud>;
  }

  async update(id: number, solicitud: Partial<Solicitud>): Promise<boolean> {
    const resultado = await this.ormRepository.update({ id }, solicitud);
    return (resultado.affected ?? 0) > 0;
  }

  async findById(id: number): Promise<Solicitud | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: { id },
      relations: { docente: true },
    });
    return this.toDomain(ormEntity);
  }

  async findDuplicate(
    criteria: SolicitudDuplicateCriteria,
  ): Promise<Solicitud | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: {
        ID_docente: criteria.ID_docente,
        motivo: criteria.motivo,
        descripcion: criteria.descripcion,
        fechaInicio:
          criteria.fechaInicio === null ? IsNull() : criteria.fechaInicio,
        fechaFin: criteria.fechaFin === null ? IsNull() : criteria.fechaFin,
      },
    });
    return this.toDomain(ormEntity);
  }

  async findByDocente(nroCedula: string): Promise<Solicitud[]> {
    const ormEntities = await this.ormRepository.find({
      where: { docente: { nroCedula } },
      relations: { docente: true },
    });
    return ormEntities.map((ent) => this.toDomain(ent)!);
  }

  async findAll(): Promise<Solicitud[]> {
    const ormEntities = await this.ormRepository.find({
      relations: { docente: true },
    });
    return ormEntities.map((ent) => this.toDomain(ent)!);
  }

  async findLastAcceptedByDocente(
    nroCedula: string,
  ): Promise<Solicitud | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: {
        docente: { nroCedula },
        estado: EstadoSolicitud.ACEPTADA,
      },
      order: {
        fechaSolicitud: 'DESC',
      },
      relations: { docente: true },
    });
    return this.toDomain(ormEntity);
  }

  async delete(id: number): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
