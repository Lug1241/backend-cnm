import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  Calificacion,
  CalificacionesLote,
  DatosCalificacion,
  EtapaCalificacion,
  ParcialCalificacion,
  QuimestreCalificacion,
  TipoPlantilla,
} from '@domain/entities/calificacion.entity';
import { ICalificacionRepository } from '@domain/interfaces/calificacion.repository.interface';
import { CalificacionOrmEntity } from '@infrastructure/database/entitites/calificacion.orm-entity';
import { InscripcionOrmEntity } from '@infrastructure/database/entitites/inscripcion.orm-entity';
@Injectable()
export class CalificacionRepository implements ICalificacionRepository {
  constructor(
    @InjectRepository(CalificacionOrmEntity)
    private readonly orm: Repository<CalificacionOrmEntity>,
  ) {}
  private toDomain(row: CalificacionOrmEntity): Calificacion {
    const numeric = (v: number | null) => (v === null ? null : Number(v));
    return {
      ...row,
      insumo1: numeric(row.insumo1),
      insumo2: numeric(row.insumo2),
      evaluacion: numeric(row.evaluacion),
      mejoramiento: numeric(row.mejoramiento),
      notaExamen: numeric(row.notaExamen),
    };
  }
  async findRegistros(ids: number[]): Promise<Calificacion[]> {
    if (!ids.length) return [];
    return (
      await this.orm.find({
        where: { inscripcionId: In(ids) },
        order: { etapa: 'ASC' },
      })
    ).map((r) => this.toDomain(r));
  }
  async guardar(
    inscripcionId: number,
    etapa: EtapaCalificacion,
    tipoPlantilla: TipoPlantilla,
    datos: DatosCalificacion,
  ): Promise<Calificacion> {
    return this.orm.manager.transaction(async (manager) => {
      // Serializa los guardados de una inscripción, incluso en etapas diferentes.
      await manager.findOneOrFail(InscripcionOrmEntity, {
        where: { id: inscripcionId },
        lock: { mode: 'pessimistic_write' },
      });
      const repo = manager.getRepository(CalificacionOrmEntity);
      const registros = await repo.find({ where: { inscripcionId } });
      if (registros.some((r) => r.tipoPlantilla !== tipoPlantilla))
        throw new ConflictException(
          'La plantilla de esta inscripción ha cambiado. Recargue las notas.',
        );
      const actual = registros.find((r) => r.etapa === etapa);
      return this.toDomain(
        await repo.save(
          repo.create({
            ...actual,
            inscripcionId,
            etapa,
            tipoPlantilla,
            ...datos,
          }),
        ),
      );
    });
  }
  async findByInscripcionIds(ids: number[]): Promise<CalificacionesLote> {
    const lote: CalificacionesLote = {
      parciales: [],
      quimestrales: [],
      finales: [],
      parcialesBe: [],
      quimestralesBe: [],
    };
    for (const r of await this.findRegistros(ids)) {
      const quimestre = r.etapa.startsWith('Q1')
        ? QuimestreCalificacion.Q1
        : QuimestreCalificacion.Q2;
      if (r.etapa === EtapaCalificacion.FINAL) {
        lote.finales.push({
          id: r.id,
          inscripcionId: r.inscripcionId,
          tipoPlantilla: r.tipoPlantilla,
          examenRecuperacion: r.notaExamen,
        });
        continue;
      }
      if (r.etapa.endsWith('EXAMEN')) {
        const examen = {
          id: r.id,
          inscripcionId: r.inscripcionId,
          quimestre,
          examen: r.notaExamen!,
        };
        if (r.tipoPlantilla === TipoPlantilla.GENERAL)
          lote.quimestrales.push(examen);
        else lote.quimestralesBe.push(examen);
      } else {
        const parcial = {
          id: r.id,
          inscripcionId: r.inscripcionId,
          quimestre,
          parcial: r.etapa.endsWith('P1')
            ? ParcialCalificacion.P1
            : ParcialCalificacion.P2,
          insumo1: r.insumo1!,
          insumo2: r.insumo2!,
          evaluacion: r.evaluacion!,
        };
        if (r.tipoPlantilla === TipoPlantilla.GENERAL)
          lote.parciales.push({
            ...parcial,
            comportamiento: r.comportamiento!,
          });
        else
          lote.parcialesBe.push({ ...parcial, mejoramiento: r.mejoramiento });
      }
    }
    return lote;
  }
}
