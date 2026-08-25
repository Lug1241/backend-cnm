import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { IPeriodoAcademicoRepository } from '../../../domain/interfaces/periodo-academico.repository.interface';
import {
  PeriodoAcademico,
  EstadoPeriodo,
} from '../../../domain/entities/periodo-academico.entity';
import { PeriodoAcademicoOrmEntity } from '../entitites/periodo-academico.orm-entity';

@Injectable()
export class PeriodoAcademicoRepository implements IPeriodoAcademicoRepository {
  constructor(
    @InjectRepository(PeriodoAcademicoOrmEntity)
    private readonly ormRepository: Repository<PeriodoAcademicoOrmEntity>,
  ) {}

  private toDomain(
    ormEntity: PeriodoAcademicoOrmEntity | null,
  ): PeriodoAcademico | null {
    if (!ormEntity) return null;
    return new PeriodoAcademico({
      id: ormEntity.id,
      descripcion: ormEntity.descripcion,
      estado: ormEntity.estado,
      fechaInicio: ormEntity.fechaInicio,
      fechaFin: ormEntity.fechaFin,
    });
  }

  async create(periodo: PeriodoAcademico): Promise<PeriodoAcademico> {
    const nuevo = this.ormRepository.create(periodo);
    const guardado = await this.ormRepository.save(nuevo);
    return this.toDomain(guardado)!;
  }

  async update(
    id: number,
    periodo: Partial<PeriodoAcademico>,
  ): Promise<boolean> {
    const resultado = await this.ormRepository.update(id, periodo);
    return (resultado.affected ?? 0) > 0;
  }

  async findById(id: number): Promise<PeriodoAcademico | null> {
    const ormEntity = await this.ormRepository.findOne({ where: { id } });
    return this.toDomain(ormEntity);
  }

  async findByDescripcion(
    descripcion: string,
  ): Promise<PeriodoAcademico | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: { descripcion },
    });
    return this.toDomain(ormEntity);
  }

  async findActive(): Promise<PeriodoAcademico | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: { estado: EstadoPeriodo.ACTIVO },
    });
    return this.toDomain(ormEntity);
  }

  async findAll(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ data: PeriodoAcademico[]; totalRows: number }> {
    const [ormEntities, totalRows] = await this.ormRepository.findAndCount({
      where: search ? { descripcion: Like(`%${search}%`) } : {},
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: ormEntities.map((ent) => this.toDomain(ent)!),
      totalRows,
    };
  }

  async delete(id: number): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
