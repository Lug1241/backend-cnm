import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  CalificacionFinal,
  CalificacionParcial,
  CalificacionParcialBe,
  CalificacionQuimestral,
  CalificacionQuimestralBe,
  CalificacionesLote,
} from '@domain/entities/calificacion.entity';
import { ICalificacionRepository } from '@domain/interfaces/calificacion.repository.interface';
import { CalificacionFinalOrmEntity } from '@infrastructure/database/entitites/calificacion-final.orm-entity';
import { CalificacionParcialBeOrmEntity } from '@infrastructure/database/entitites/calificacion-parcial-be.orm-entity';
import { CalificacionParcialOrmEntity } from '@infrastructure/database/entitites/calificacion-parcial.orm-entity';
import { CalificacionQuimestralBeOrmEntity } from '@infrastructure/database/entitites/calificacion-quimestral-be.orm-entity';
import { CalificacionQuimestralOrmEntity } from '@infrastructure/database/entitites/calificacion-quimestral.orm-entity';

@Injectable()
export class CalificacionRepository implements ICalificacionRepository {
  constructor(
    @InjectRepository(CalificacionParcialOrmEntity)
    private readonly parcialRepository: Repository<CalificacionParcialOrmEntity>,
    @InjectRepository(CalificacionQuimestralOrmEntity)
    private readonly quimestralRepository: Repository<CalificacionQuimestralOrmEntity>,
    @InjectRepository(CalificacionFinalOrmEntity)
    private readonly finalRepository: Repository<CalificacionFinalOrmEntity>,
    @InjectRepository(CalificacionParcialBeOrmEntity)
    private readonly parcialBeRepository: Repository<CalificacionParcialBeOrmEntity>,
    @InjectRepository(CalificacionQuimestralBeOrmEntity)
    private readonly quimestralBeRepository: Repository<CalificacionQuimestralBeOrmEntity>,
  ) {}

  async findByInscripcionIds(
    inscripcionIds: number[],
  ): Promise<CalificacionesLote> {
    const ids = [...new Set(inscripcionIds)].filter(
      (id) => Number.isInteger(id) && id > 0,
    );

    if (ids.length === 0) {
      return {
        parciales: [],
        quimestrales: [],
        finales: [],
        parcialesBe: [],
        quimestralesBe: [],
      };
    }

    const [parciales, quimestrales, finales, parcialesBe, quimestralesBe] =
      await Promise.all([
        this.parcialRepository.find({
          where: { inscripcionId: In(ids) },
          order: { updatedAt: 'DESC', id: 'DESC' },
        }),
        this.quimestralRepository.find({
          where: { inscripcionId: In(ids) },
          order: { updatedAt: 'DESC', id: 'DESC' },
        }),
        this.finalRepository.find({
          where: { inscripcionId: In(ids) },
          order: { updatedAt: 'DESC', id: 'DESC' },
        }),
        this.parcialBeRepository.find({
          where: { inscripcionId: In(ids) },
          order: { updatedAt: 'DESC', id: 'DESC' },
        }),
        this.quimestralBeRepository.find({
          where: { inscripcionId: In(ids) },
          order: { updatedAt: 'DESC', id: 'DESC' },
        }),
      ]);

    return {
      parciales: parciales.map((row): CalificacionParcial => ({
        id: row.id,
        inscripcionId: row.inscripcionId,
        insumo1: Number(row.insumo1),
        insumo2: Number(row.insumo2),
        evaluacion: Number(row.evaluacion),
        comportamiento: row.comportamiento,
        quimestre: row.quimestre,
        parcial: row.parcial,
      })),
      quimestrales: quimestrales.map((row): CalificacionQuimestral => ({
        id: row.id,
        inscripcionId: row.inscripcionId,
        examen: Number(row.examen),
        quimestre: row.quimestre,
      })),
      finales: finales.map((row): CalificacionFinal => ({
        id: row.id,
        inscripcionId: row.inscripcionId,
        examenRecuperacion:
          row.examenRecuperacion === null
            ? null
            : Number(row.examenRecuperacion),
      })),
      parcialesBe: parcialesBe.map((row): CalificacionParcialBe => ({
        id: row.id,
        inscripcionId: row.inscripcionId,
        insumo1: Number(row.insumo1),
        insumo2: Number(row.insumo2),
        evaluacion: Number(row.evaluacion),
        mejoramiento:
          row.mejoramiento === null ? null : Number(row.mejoramiento),
        quimestre: row.quimestre,
        parcial: row.parcial,
      })),
      quimestralesBe: quimestralesBe.map((row): CalificacionQuimestralBe => ({
        id: row.id,
        inscripcionId: row.inscripcionId,
        examen: Number(row.examen),
        quimestre: row.quimestre,
      })),
    };
  }
}
