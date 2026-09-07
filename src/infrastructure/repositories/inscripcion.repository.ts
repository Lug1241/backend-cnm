import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IInscripcionRepository } from '@domain/interfaces/inscripcion.repository.interface';
import { Inscripcion } from '@domain/entities/inscripcion.entity';
import { InscripcionOrmEntity } from '@infrastructure/database/entitites/inscripcion.orm-entity';

@Injectable()
export class InscripcionRepository implements IInscripcionRepository {
    constructor(
        @InjectRepository(InscripcionOrmEntity)
        private readonly ormRepository: Repository<InscripcionOrmEntity>
    ) {}

    private toDomain(ormEntity: InscripcionOrmEntity): Inscripcion {
        return new Inscripcion({
            id: ormEntity.id,
            asignacion: ormEntity.asignacion as any,
            matricula: ormEntity.matricula as any,
            createdAt: ormEntity.createdAt,
            updatedAt: ormEntity.updatedAt
        });
    }

    async create(inscripcion: Inscripcion): Promise<Inscripcion> {
        const ormEntity = this.ormRepository.create({
            asignacion: { id: inscripcion.asignacion.id },
            matricula: { id: inscripcion.matricula.id }
        });
        const saved = await this.ormRepository.save(ormEntity);
        return this.toDomain(saved);
    }

    async update(id: number, inscripcion: Partial<Inscripcion>): Promise<boolean> {
        const updateData: any = {};
        if (inscripcion.asignacion) updateData.asignacion = { id: inscripcion.asignacion.id };
        if (inscripcion.matricula) updateData.matricula = { id: inscripcion.matricula.id };

        const result = await this.ormRepository.update(id, updateData);
        return (result.affected ?? 0) > 0;
    }

    async findById(id: number): Promise<Inscripcion | null> {
        const ormEntity = await this.ormRepository.findOne({
            where: { id },
            relations: {
                asignacion: true,
                matricula: true
            }
        });
        return ormEntity ? this.toDomain(ormEntity) : null;
    }

    async delete(id: number): Promise<void> {
        await this.ormRepository.delete(id);
    }

    async checkInscripcionDuplicada(idAsignacion: number, idMatricula: number): Promise<boolean> {
        const count = await this.ormRepository.count({
            where: {
                asignacion: { id: idAsignacion },
                matricula: { id: idMatricula }
            }
        });
        return count > 0;
    }

    async checkInscripcionMateriaOtroDocente(idMateria: number, idMatricula: number): Promise<boolean> {
        const count = await this.ormRepository.count({
            where: {
                matricula: { id: idMatricula },
                asignacion: { materia: { id: idMateria } }
            },
            relations: {
                asignacion: {
                    materia: true,
                }
            }
        });
        return count > 0;
    }

    async findByAsignacion(idAsignacion: number): Promise<any[]> {
        const ormEntities = await this.ormRepository.createQueryBuilder('inscripcion')
            .leftJoinAndSelect('inscripcion.matricula', 'matricula')
            .leftJoinAndSelect('matricula.estudiante', 'estudiante') 
            .where('inscripcion.asignacion = :idAsignacion', { idAsignacion })
            .getMany();
        
        return ormEntities; 
    }

    async findByMatricula(idMatricula: number): Promise<Inscripcion[]> {
        const ormEntities = await this.ormRepository.find({
            where: { matricula: { id: idMatricula } },
            relations: {
                matricula: true,
                asignacion: {
                    materia: true,
                    docente: true,
                }
            }
        });
        return ormEntities.map(e => this.toDomain(e));
    }

    async findIndividualesByDocente(idDocente: string, idPeriodo: number, page: number, limit: number): Promise<{ data: Inscripcion[]; totalRows: number }> {
        const [ormEntities, totalRows] = await this.ormRepository.createQueryBuilder('inscripcion')
            .leftJoinAndSelect('inscripcion.asignacion', 'asignacion')
            .leftJoinAndSelect('asignacion.materia', 'materia')
            .leftJoinAndSelect('asignacion.docente', 'docente')
            .leftJoinAndSelect('inscripcion.matricula', 'matricula')
            .leftJoinAndSelect('matricula.estudiante', 'estudiante')
            .where('docente.nroCedula = :idDocente', { idDocente }) // Asumiendo que usas nroCedula aquí como en el original
            .andWhere('materia.tipo = :tipo', { tipo: 'individual' })
            .andWhere('matricula.periodoAcademico = :idPeriodo', { idPeriodo })
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { data: ormEntities.map(e => this.toDomain(e)), totalRows };
    }

    async findIndividualesByNivel(nivel: string, idPeriodo: number, page: number, limit: number): Promise<{ data: Inscripcion[]; totalRows: number }> {
        const [ormEntities, totalRows] = await this.ormRepository.createQueryBuilder('inscripcion')
            .innerJoinAndSelect('inscripcion.asignacion', 'asignacion')
            .innerJoinAndSelect('asignacion.materia', 'materia', 'materia.nivel = :nivel AND materia.tipo = :tipo', { nivel, tipo: 'individual' })
            .leftJoinAndSelect('asignacion.docente', 'docente')
            .innerJoinAndSelect('inscripcion.matricula', 'matricula', 'matricula.periodoAcademico = :idPeriodo', { idPeriodo })
            .leftJoinAndSelect('matricula.estudiante', 'estudiante')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { data: ormEntities.map(e => this.toDomain(e)), totalRows };
    }
}