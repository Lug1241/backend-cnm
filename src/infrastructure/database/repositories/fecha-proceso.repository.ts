import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IFechaProcesoRepository } from '../../../domain/interfaces/fecha-proceso.repository.interface';
import {
  FechaProceso,
  TipoProceso,
} from '../../../domain/entities/fecha-proceso.entity';
import { FechaProcesoOrmEntity } from '../entitites/fecha-proceso.orm-entity';

@Injectable()
export class FechaProcesoRepository implements IFechaProcesoRepository {
  constructor(
    @InjectRepository(FechaProcesoOrmEntity)
    private readonly ormRepository: Repository<FechaProcesoOrmEntity>,
  ) {}

  async create(fechaProceso: Partial<FechaProceso>): Promise<FechaProceso> {
    const ormEntity = this.ormRepository.create({
      fechaProceso: fechaProceso.fechaProceso,
      proceso: fechaProceso.proceso,
      descripcion: fechaProceso.descripcion,
    });

    const savedEntity = await this.ormRepository.save(ormEntity);
    return this.toDomain(savedEntity)!;
  }

  async findById(id: number): Promise<FechaProceso | null> {
    const ormEntity = await this.ormRepository.findOne({ where: { id } });
    if (!ormEntity) return null;
    return this.toDomain(ormEntity);
  }

  async findAll(
    page: number,
    limit: number,
    proceso?: TipoProceso,
  ): Promise<{ data: FechaProceso[]; totalRows: number }> {
    const [ormEntities, totalRows] = await this.ormRepository.findAndCount({
      where: !proceso ? {} : { proceso },
      skip: (page - 1) * limit,
      take: limit,
    });

    const data = ormEntities.map((entity) => this.toDomain(entity)!);
    return { data, totalRows };
  }

  async update(
    id: number,
    fechaProceso: Partial<FechaProceso>,
  ): Promise<FechaProceso> {
    await this.ormRepository.update(id, fechaProceso);

    const updated = await this.ormRepository.findOne({ where: { id } });
    return this.toDomain(updated)!;
  }

  async delete(id: number): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async findLatestByProceso(
    proceso: TipoProceso,
  ): Promise<FechaProceso | null> {
    return await this.ormRepository.findOne({
      where: { proceso },
      order: { id: 'DESC' },
    });
  }

  private toDomain(
    ormEntity: FechaProcesoOrmEntity | null,
  ): FechaProceso | null {
    if (!ormEntity) return null;
    return new FechaProceso({
      id: ormEntity.id,
      fechaProceso: ormEntity.fechaProceso,
      proceso: ormEntity.proceso,
      descripcion: ormEntity.descripcion,
    });
  }
}
