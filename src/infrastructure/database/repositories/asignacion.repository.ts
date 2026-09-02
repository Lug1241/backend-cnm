import { IAsignacionRepository, Jornada } from "@domain/interfaces/asignacion.repository.interface";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AsignacionOrmEntity } from "../entitites/asignacion.orm-entity";
import { Repository, Not, ILike, MoreThanOrEqual, LessThanOrEqual } from "typeorm";
import { Asignacion } from "@domain/entities/asignacion.entity";
import { Docente } from "@domain/entities/docente.entity";
import { NivelMateria, TipoMateria } from "@domain/entities/materia.entity";
import { PeriodoAcademico } from "@domain/entities/periodo-academico.entity";

@Injectable()
export class AsignacionRepository implements IAsignacionRepository {
    constructor(
        @InjectRepository(AsignacionOrmEntity)
        private readonly ormRepository: Repository<AsignacionOrmEntity>
    ) {}

    async create(asignacion: Asignacion): Promise<Asignacion> {
        const ormEntity = this.ormRepository.create(asignacion);
        const savedEntity = await this.ormRepository.save(ormEntity);
        return this.toDomain(savedEntity)!;
    }

    async update(id: number, asignacion: Asignacion): Promise<Asignacion> {
        await this.ormRepository.update(id, asignacion);
        const updated = await this.findById(id);

        return updated!;
    }

    async findById(id: number): Promise<Asignacion | null> {
        const ormEntity = await this.ormRepository.findOne({
            where: { id },
            relations: { docente: true, materia: true, periodoAcademico: true } // Extrae los datos foráneos
        });
        if (!ormEntity) return null;
        return this.toDomain(ormEntity);
    }

    async findByDocente(docente: Docente): Promise<{ data: Asignacion[]; totalRows: number; }> {
        const [ormEntities, totalRows] = await this.ormRepository.findAndCount({
            where: { docente: { id: docente.id } },
            relations: { docente: true, materia: true, periodoAcademico: true }
        });
        return { data: ormEntities.map(e => this.toDomain(e)!), totalRows };
    }

    async findByNivelMateria(nivel: NivelMateria, periodo: PeriodoAcademico): Promise<{ data: Asignacion[]; totalRows: number; }> {
        const [ormEntities, totalRows] = await this.ormRepository.findAndCount({
            where: {
                periodoAcademico: { id: periodo.id },
                materia: { nivel: nivel, tipo: Not(TipoMateria.INDIVIDUAL) } 
            },
            relations: { docente: true, materia: true, periodoAcademico: true }
        });
        return { data: ormEntities.map(e => this.toDomain(e)!), totalRows };
    }

    async findAll(page: number, limit: number, search: string, periodo: PeriodoAcademico): Promise<{ data: Asignacion[]; totalRows: number; }> {
        const whereCondition: any = {
            periodoAcademico: { id: periodo.id }
        };

        if (search && search.trim() !== '') {
            whereCondition.materia = { nombre: ILike(`%${search}%`) };
        }

        const [ormEntities, totalRows] = await this.ormRepository.findAndCount({
            where: whereCondition,
            relations: { docente: true, materia: true, periodoAcademico: true },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data: ormEntities.map(e => this.toDomain(e)!), totalRows };
    }

    async findByPeriodo(periodo: PeriodoAcademico): Promise<{ data: Asignacion[]; totalRows: number; }> {
        const [ormEntities, totalRows] = await this.ormRepository.findAndCount({
            where: { periodoAcademico: { id: periodo.id } },
            relations: { docente: true, materia: true, periodoAcademico: true }
        });
        return { data: ormEntities.map(e => this.toDomain(e)!), totalRows };
    }

    async findByMateria(periodo: PeriodoAcademico, nivelMateria: NivelMateria, materia: string, jornada: Jornada): Promise<{ data: Asignacion[]; totalRows: number; }> {
        let inicio = '00:00:00';
        let fin = '23:59:59';
        
        if (jornada === Jornada.MATUTINA) {
            inicio = '07:00:00';
            fin = '12:15:00';
        } else if (jornada === Jornada.VESPERTINA) {
            inicio = '14:30:00';
            fin = '19:00:00';
        }

        const whereCondition: any = {
            periodoAcademico: { id: periodo.id },
            materia: { nivel: nivelMateria, tipo: Not(TipoMateria.INDIVIDUAL) },
            horaInicio: MoreThanOrEqual(inicio),
            horaFin: LessThanOrEqual(fin)
        };

        if (materia && materia !== 'all') {
            whereCondition.materia.nombre = ILike(`%${materia}%`); // Búsqueda insensible a mayúsculas
        }

        const [ormEntities, totalRows] = await this.ormRepository.findAndCount({
            where: whereCondition,
            relations: { docente: true, materia: true, periodoAcademico: true }
        });
        return { data: ormEntities.map(e => this.toDomain(e)!), totalRows };
    }

    async findByDocenteSinMatricula(docente: Docente, periodo: PeriodoAcademico): Promise<{ data: Asignacion[]; totalRows: number; }> {
        //TODO: QueryBuilder usado porque aún no existe la relación "matriculas" en AsignacionOrmEntity
        const [ormEntities, totalRows] = await this.ormRepository.createQueryBuilder('asignacion')
            .leftJoinAndSelect('asignacion.docente', 'docente')
            .leftJoinAndSelect('asignacion.materia', 'materia')
            .leftJoinAndSelect('asignacion.periodoAcademico', 'periodoAcademico')
            .leftJoin('asignacion.matriculas', 'matricula') //TODO: Esta relación deberá agregarse luego
            .where('docente.id = :docenteId', { docenteId: docente.id })
            .andWhere('matricula.id IS NULL')
            .andWhere('materia.tipo = :tipo', { tipo: 'individual' })
            .getManyAndCount();

        return { data: ormEntities.map(e => this.toDomain(e)!), totalRows };
    }

    async findBySinMatricula(): Promise<{ data: Asignacion[]; totalRows: number; }> {
        const [ormEntities, totalRows] = await this.ormRepository.createQueryBuilder('asignacion')
            .leftJoinAndSelect('asignacion.docente', 'docente')
            .leftJoinAndSelect('asignacion.materia', 'materia')
            .leftJoinAndSelect('asignacion.periodoAcademico', 'periodoAcademico')
            .leftJoin('asignacion.matriculas', 'matricula') 
            .where('matricula.id IS NULL')
            .getManyAndCount();

        return { data: ormEntities.map(e => this.toDomain(e)!), totalRows };
    }

    async delete(id: number): Promise<void> {
        const result = await this.ormRepository.delete(id);
        if (result.affected === 0) {
            throw new Error(`No se puede eliminar: la asignación con ID ${id} no existe.`);
        }
    }

    private toDomain(ormEntity: AsignacionOrmEntity | null): Asignacion | null {
        if (!ormEntity) return null;

        return new Asignacion({
            id: ormEntity.id,
            paralelo: ormEntity.paralelo,
            horaInicio: ormEntity.horaInicio,
            horaFin: ormEntity.horaFin,
            hora1: ormEntity.hora1,
            hora2: ormEntity.hora2,
            dias: ormEntity.dias,
            cupos: ormEntity.cupos,
            docente: ormEntity.docente as any, 
            materia: ormEntity.materia as any,
            periodoAcademico: ormEntity.periodoAcademico as any
        });
    }
}