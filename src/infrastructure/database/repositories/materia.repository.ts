import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { IMateriaRepository } from '../../../domain/interfaces/materia.repository.interface';
import { Materia, NivelMateria, TipoMateria } from '../../../domain/entities/materia.entity';
import { MateriaOrmEntity } from '../entitites/materia.orm-entity';

@Injectable()
export class MateriaRepository implements IMateriaRepository {
    constructor(
        @InjectRepository(MateriaOrmEntity)
        private readonly ormRepository: Repository<MateriaOrmEntity>,
    ) {}

    async create(materia: Materia): Promise<Materia> {
        const fecha = new Date()
        const ormEntity = this.ormRepository.create({
            nombre: materia.nombre,
            nivel: materia.nivel,
            tipo: materia.tipo,
            observaciones: materia.observaciones,
            edadMin: materia.edadMin,
            fechaCreacion: fecha,
            fechaModificacion: fecha,
        });
        
        const savedEntity = await this.ormRepository.save(ormEntity);
        return this.toDomain(savedEntity)!; 
    }

    async update(id: number, materia: Partial<Materia>): Promise<boolean> {
        const result = await this.ormRepository.update(id, {
            nombre: materia.nombre,
            nivel: materia.nivel,
            tipo: materia.tipo,
            observaciones: materia.observaciones,
            edadMin: materia.edadMin,
        });

        return (result.affected ?? 0) > 0;
    }

    async findById(id: number): Promise<Materia | null> {
        const ormEntity = await this.ormRepository.findOne({ where: { id } });
        if (!ormEntity) return null;
        return this.toDomain(ormEntity);
    }

    async findAll(page: number, limit: number, search: string): Promise<{ data: Materia[]; totalRows: number }> {
        const [ormEntities, totalRows] = await this.ormRepository.findAndCount({
            where: search ? { nombre: Like(`%${search}%`) } : {},
            skip: (page - 1) * limit,
            take: limit,
        });
        
        const data = ormEntities.map(entity => this.toDomain(entity)!);
        return { data, totalRows };
    }

    async findByNivel(nivel: NivelMateria, page: number, limit: number): Promise<{ data: Materia[]; totalRows: number }> {
        const [ormEntities, totalRows] = await this.ormRepository.findAndCount({
            where: { nivel },
            skip: (page - 1) * limit,
            take: limit,
        });
        
        const data = ormEntities.map(entity => this.toDomain(entity)!);
        return { data, totalRows };
    }

    async findByTipo(tipo: TipoMateria, page: number, limit: number): Promise<{ data: Materia[]; totalRows: number }> {
        const [ormEntities, totalRows] = await this.ormRepository.findAndCount({
            where: { tipo },
            skip: (page - 1) * limit,
            take: limit,
        });
        
        const data = ormEntities.map(entity => this.toDomain(entity)!);
        return { data, totalRows };
    }

    async findByNombre(nombre: string): Promise<Materia | null> {
        const ormEntity = await this.ormRepository.findOne({ where: { nombre } });
        if (!ormEntity) return null;
        return this.toDomain(ormEntity);
    }

    async delete(id: number): Promise<void> {
        await this.ormRepository.delete(id);
    }

    private toDomain(ormEntity: MateriaOrmEntity | null): Materia | null {
        if (!ormEntity) return null;
        return new Materia({
            id: ormEntity.id,
            nombre: ormEntity.nombre,
            nivel: ormEntity.nivel,
            tipo: ormEntity.tipo,
            observaciones: ormEntity.observaciones,
            edadMin: ormEntity.edadMin,
        });
    }
}