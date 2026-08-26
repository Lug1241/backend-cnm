import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { IMateriaRepository } from '../../../domain/interfaces/materia.repository.interface';
import {
  Materia,
  NivelMateria,
  TipoMateria,
} from '../../../domain/entities/materia.entity';
import { MateriaOrmEntity } from '../entitites/materia.orm-entity';

@Injectable()
export class MateriaRepository implements IMateriaRepository {
    constructor(
        @InjectRepository(MateriaOrmEntity)
        private readonly ormRepository: Repository<MateriaOrmEntity>,
    ) {}

    private toDomain(
        ormEntity: MateriaOrmEntity | null,
    ): Materia | null {
        if(!ormEntity) return null;
        return new Materia({
            id: ormEntity.id,
            nombre: ormEntity.nombre,
            nivel: ormEntity.nivel,
            tipo: ormEntity.tipo,
            observaciones: ormEntity.observaciones,
            edadMin: ormEntity.edadMin,
        });
    }

    create(materia: Materia): Promise<Materia> {
        const entity = this.ormRepository.create(
            materia as unknown as MateriaOrmEntity,
        );

        return this.ormRepository.save(entity) as Promise<Materia>;
    }
    update(id: number, materia: Partial<Materia>): Promise<boolean> {
        return this.ormRepository
            .update(id, materia as unknown as Partial<MateriaOrmEntity>)
            .then((result) => (result.affected ?? 0) > 0);
    }

    async findById(id: number): Promise<Materia | null> {
        const ormEntity = await this.ormRepository.findOne({ where: { id }});
        if(!ormEntity) return null;
        return this.toDomain(ormEntity);
    }

    findByNombre(nombre: string): Promise<Materia | null> {
        throw new Error('Method not implemented.');
    }
    findByNivel(nivel: NivelMateria, page: number, limit: number): Promise<{ data: Materia[]; totalRows: number; }> {
        throw new Error('Method not implemented.');
    }
    findByTipo(tipo: TipoMateria, page: number, limit: number): Promise<{ data: Materia[]; totalRows: number; }> {
        throw new Error('Method not implemented.');
    }
    findAll(page: number, limit: number, search: string): Promise<{ data: Materia[]; totalRows: number; }> {
        throw new Error('Method not implemented.');
    }
    delete(id: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
}