import { Asignacion } from "@domain/entities/asignacion.entity";
import { Docente } from "@domain/entities/docente.entity";
import { NivelMateria, TipoMateria } from "@domain/entities/materia.entity";
import { PeriodoAcademico } from "@domain/entities/periodo-academico.entity";
import { Matricula } from "@domain/entities/matricula.entity";

export const I_ASIGNACION_REPOSITORY = 'IAsignacionRepository';

export enum Jornada {
    MATUTINA = 'Matutina',
    VESPERTINA = 'Vespertina',
}

export interface IAsignacionRepository {
    create(asignacion: Asignacion): Promise <Asignacion>;
    update(id: number, asignacion: Asignacion): Promise <Asignacion>;
    delete(id: number): Promise<void>;
    decrementarCupo(id: number): Promise<boolean>;
    incrementarCupo(id: number): Promise<boolean>;

    findById(id: number): Promise<Asignacion | null>;

    findAllPaginated(
        skip: number,
        limit: number,
        search: string,
        periodo: PeriodoAcademico,
        grupo: NivelMateria[],
    ): Promise<{ data: Asignacion[]; totalRows: number }>;

    findByPeriodo(periodo: PeriodoAcademico): Promise<{ data: Asignacion[]; totalRows: number }>;
    findByDocente(docente: Docente): Promise<{ data: Asignacion[]; totalRows: number }>;
    findByMateria(
        periodo: PeriodoAcademico, 
        nivelMateria: NivelMateria, 
        materia: string, 
        jornada: Jornada,
        tipo?: TipoMateria,
        page?: number,
        limit?: number,
    ): Promise<{ data: Asignacion[]; totalRows: number }>;
    
    findBySinMatricula(
        skip: number,
        limit: number,
        idDocente?: number,
        periodo?: number,
    ): Promise<{ data: Asignacion[]; totalRows: number }>;
    
}