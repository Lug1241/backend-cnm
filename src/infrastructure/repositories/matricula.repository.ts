import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Matricula } from '@domain/entities/matricula.entity';
import { type IMatriculaRepository } from '@domain/interfaces/matricula.repository.interface';
import { MatriculaOrmEntity } from '../database/entitites/matricula.orm-entity';
import { EstudianteOrmEntity } from '../database/entitites/estudiante.orm-entity';
import { PeriodoAcademicoOrmEntity } from '../database/entitites/periodo-academico.orm-entity';

@Injectable()
export class MatriculaRepository implements IMatriculaRepository {
  constructor(
    @InjectRepository(MatriculaOrmEntity)
    private readonly ormRepository: Repository<MatriculaOrmEntity>,
  ) {}

  private toDomain(ormEntity: MatriculaOrmEntity | null): Matricula | null {
    if (!ormEntity) return null;

    return new Matricula({
      id: ormEntity.id,
      nivel: ormEntity.nivel,
      estado: ormEntity.estado,
      estudianteId: ormEntity.estudianteId,
      periodoAcademicoId: ormEntity.periodoAcademicoId,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  async create(matricula: Matricula): Promise<Matricula> {
    const ahora = new Date();
    const entidad = this.ormRepository.create({
      nivel: matricula.nivel,
      estado: matricula.estado,
      estudianteId: matricula.estudianteId,
      periodoAcademicoId: matricula.periodoAcademicoId,
      createdAt: ahora,
      updatedAt: ahora,
    });

    try {
      return this.toDomain(await this.ormRepository.save(entidad))!;
    } catch (error) {
      this.manejarError(error);
    }
  }

  async update(id: number, matricula: Partial<Matricula>): Promise<boolean> {
    try {
      const resultado = await this.ormRepository.update(id, {
        nivel: matricula.nivel,
        estado: matricula.estado,
        estudianteId: matricula.estudianteId,
        periodoAcademicoId: matricula.periodoAcademicoId,
        updatedAt: new Date(),
      });
      return (resultado.affected ?? 0) > 0;
    } catch (error) {
      this.manejarError(error);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.ormRepository.delete(id);
    } catch (error) {
      this.manejarError(error);
    }
  }

  async findById(id: number): Promise<Matricula | null> {
    return this.toDomain(await this.ormRepository.findOne({ where: { id } }));
  }

  async findByEstudianteYPeriodo(
    estudianteId: number,
    periodoAcademicoId: number,
  ): Promise<Matricula | null> {
    return this.toDomain(
      await this.ormRepository.findOne({
        where: { estudianteId, periodoAcademicoId },
      }),
    );
  }

  async findPeriodosByEstudiante(estudianteId: number): Promise<Matricula[]> {
    const entidades = await this.ormRepository.find({
      where: { estudianteId },
      order: { id: 'ASC' },
    });
    return entidades.map((ent) => this.toDomain(ent)!);
  }

  async existeEstudiante(id: number): Promise<boolean> {
    return this.ormRepository.manager.existsBy(EstudianteOrmEntity, { id });
  }

  async existePeriodo(id: number): Promise<boolean> {
    return this.ormRepository.manager.existsBy(PeriodoAcademicoOrmEntity, {
      id,
    });
  }

  private manejarError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const { code } = error.driverError as { code?: string };
      if (code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          'El estudiante ya tiene una matrícula en este período académico',
        );
      }
      if (code === 'ER_NO_REFERENCED_ROW_2') {
        throw new NotFoundException(
          'El estudiante o período académico no existe',
        );
      }
      if (code === 'ER_ROW_IS_REFERENCED_2') {
        throw new ConflictException(
          'La matrícula tiene registros relacionados',
        );
      }
    }
    throw error;
  }
}
