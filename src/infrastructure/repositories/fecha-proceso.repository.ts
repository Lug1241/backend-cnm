import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { IFechaProcesoRepository } from '../../domain/interfaces/fecha-proceso.repository.interface';
import {
  FechaProceso,
  TipoProceso,
} from '../../domain/entities/fecha-proceso.entity';
import { FechaProcesoOrmEntity } from '../database/entitites/fecha-proceso.orm-entity';
import { FechaNotaOrmEntity } from '../database/entitites/fecha-nota.orm-entity';

@Injectable()
export class FechaProcesoRepository implements IFechaProcesoRepository {
  constructor(
    @InjectRepository(FechaProcesoOrmEntity)
    private readonly ormRepository: Repository<FechaProcesoOrmEntity>,
    @InjectRepository(FechaNotaOrmEntity)
    private readonly fechaNotaRepository: Repository<FechaNotaOrmEntity>,
  ) {}

  async create(fechaProceso: Partial<FechaProceso>): Promise<FechaProceso> {
    if (fechaProceso.proceso === TipoProceso.FECHAS_NOTAS) {
      const fechaNota = this.fechaNotaRepository.create({
        fechaInicio: fechaProceso.fechaInicio,
        fechaFin: fechaProceso.fechaFin,
        descripcion: fechaProceso.descripcion ?? undefined,
      });

      const savedFechaNota = await this.fechaNotaRepository.save(fechaNota);
      return this.fechaNotaToDomain(savedFechaNota);
    }

    const ormEntity = this.ormRepository.create({
      fechaInicio: fechaProceso.fechaInicio,
      fechaFin: fechaProceso.fechaFin,
      proceso: fechaProceso.proceso,
      descripcion: fechaProceso.descripcion,
    });

    const savedEntity = await this.ormRepository.save(ormEntity);
    return this.toDomain(savedEntity)!;
  }

  async findById(
    id: number,
    proceso?: TipoProceso,
  ): Promise<FechaProceso | null> {
    if (proceso === TipoProceso.FECHAS_NOTAS) {
      const fechaNota = await this.fechaNotaRepository.findOne({
        where: { id },
      });

      return fechaNota ? this.fechaNotaToDomain(fechaNota) : null;
    }

    const ormEntity = await this.ormRepository.findOne({ where: { id } });
    if (!ormEntity) return null;
    return this.toDomain(ormEntity);
  }

  async findAll(
    page: number,
    limit: number,
    procesos?: TipoProceso[],
  ): Promise<{ data: FechaProceso[]; totalRows: number }> {
    if (procesos?.includes(TipoProceso.FECHAS_NOTAS)) {
      const procesosSinFechasNotas = procesos.filter(
        (proceso) => proceso !== TipoProceso.FECHAS_NOTAS,
      );

      const valoresProceso = procesosSinFechasNotas.flatMap((proceso) =>
        this.obtenerValoresProceso(proceso),
      );

      const [ormEntities, fechasNotas] = await Promise.all([
        valoresProceso.length === 0
          ? Promise.resolve([])
          : this.ormRepository.find({
              where: { proceso: In(valoresProceso) },
            }),
        this.fechaNotaRepository.find(),
      ]);

      const data = [
        ...ormEntities.map((entity) => this.toDomain(entity)!),
        ...fechasNotas.map((entity) => this.fechaNotaToDomain(entity)),
      ];

      return {
        data: data.slice((page - 1) * limit, page * limit),
        totalRows: data.length,
      };
    }

    const valoresProceso = procesos?.flatMap((proceso) =>
      this.obtenerValoresProceso(proceso),
    );

    const [ormEntities, totalRows] = await this.ormRepository.findAndCount({
      where:
        !valoresProceso || valoresProceso.length === 0
          ? {}
          : { proceso: In(valoresProceso) },
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
    if (fechaProceso.proceso === TipoProceso.FECHAS_NOTAS) {
      await this.fechaNotaRepository.update(id, {
        fechaInicio: fechaProceso.fechaInicio,
        fechaFin: fechaProceso.fechaFin,
        descripcion: fechaProceso.descripcion ?? undefined,
      });

      const updatedFechaNota = await this.fechaNotaRepository.findOne({
        where: { id },
      });

      return this.fechaNotaToDomain(updatedFechaNota!);
    }

    await this.ormRepository.update(id, fechaProceso);

    const updated = await this.ormRepository.findOne({ where: { id } });
    return this.toDomain(updated)!;
  }

  async delete(id: number, proceso?: TipoProceso): Promise<void> {
    if (proceso === TipoProceso.FECHAS_NOTAS) {
      await this.fechaNotaRepository.delete(id);
      return;
    }

    await this.ormRepository.delete(id);
  }

  async findLatestByProceso(
    proceso: TipoProceso,
  ): Promise<FechaProceso | null> {
    if (proceso === TipoProceso.FECHAS_NOTAS) {
      const fechaNota = await this.fechaNotaRepository.findOne({
        where: {},
        order: { fechaInicio: 'DESC' },
      });

      return fechaNota ? this.fechaNotaToDomain(fechaNota) : null;
    }

    const ormEntity = await this.ormRepository.findOne({
      where: {
        proceso: In(this.obtenerValoresProceso(proceso)),
      },
      order: {
        fechaInicio: 'DESC',
      },
    });

    return this.toDomain(ormEntity);
  }

  async existsByProcesoAndDescripcion(
    proceso: TipoProceso,
    descripcion: string,
    excludeId?: number,
  ): Promise<boolean> {
    if (proceso === TipoProceso.FECHAS_NOTAS) {
      const where = excludeId
        ? { descripcion, id: Not(excludeId) }
        : { descripcion };

      const fechaNota = await this.fechaNotaRepository.findOne({ where });
      return !!fechaNota;
    }

    const where = excludeId
      ? {
          proceso: In(this.obtenerValoresProceso(proceso)),
          descripcion,
          id: Not(excludeId),
        }
      : {
          proceso: In(this.obtenerValoresProceso(proceso)),
          descripcion,
        };

    const existente = await this.ormRepository.findOne({ where });

    return !!existente;
  }

  private obtenerValoresProceso(proceso: TipoProceso): string[] {
    switch (proceso) {
      case TipoProceso.MATRICULA:
        return [
          TipoProceso.MATRICULA,
          'Matricula',
          'MATRICULA',
          'Período de matrícula',
          'Periodo de matricula',
        ];

      case TipoProceso.ACTUALIZACION_DATOS:
        return [
          TipoProceso.ACTUALIZACION_DATOS,
          'Actualización de Datos',
          'Actualización de datos',
        ];

      case TipoProceso.FECHAS_NOTAS:
        return [TipoProceso.FECHAS_NOTAS, 'Fechas notas', 'Fechas Notas'];

      default:
        return [proceso];
    }
  }

  private normalizarProceso(proceso: string): TipoProceso {
    for (const tipo of Object.values(TipoProceso)) {
      if (this.obtenerValoresProceso(tipo).includes(proceso)) {
        return tipo;
      }
    }

    return proceso as TipoProceso;
  }

  private toDomain(
    ormEntity: FechaProcesoOrmEntity | null,
  ): FechaProceso | null {
    if (!ormEntity) return null;
    return new FechaProceso({
      id: ormEntity.id,
      fechaInicio: ormEntity.fechaInicio,
      fechaFin: ormEntity.fechaFin,
      proceso: this.normalizarProceso(ormEntity.proceso),
      descripcion: ormEntity.descripcion,
    });
  }

  private fechaNotaToDomain(ormEntity: FechaNotaOrmEntity): FechaProceso {
    return new FechaProceso({
      id: ormEntity.id,
      fechaInicio: ormEntity.fechaInicio,
      fechaFin: ormEntity.fechaFin,
      proceso: TipoProceso.FECHAS_NOTAS,
      descripcion: ormEntity.descripcion,
    });
  }
}
