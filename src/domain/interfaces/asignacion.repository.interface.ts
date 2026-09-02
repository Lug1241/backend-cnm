import { Asignacion } from "@domain/entities/asignacion.entity";
import { Docente } from "@domain/entities/docente.entity";
import { Materia, NivelMateria } from "@domain/entities/materia.entity";
import { PeriodoAcademico } from "@domain/entities/periodo-academico.entity";

export const I_ASIGNACION_REPOSITORY = 'IAsignacionRepository';

export enum Jornada {
    MATUTINA = 'Matutina',
    VESPERTINA = 'Vespertina',
}

export interface IAsignacionRepository {
    create(asignacion: Asignacion): Promise <Asignacion>;
    update(id: number, asignacion: Asignacion): Promise <Asignacion>;
    findById(id: number): Promise<Asignacion | null>;
    findByDocente(docente: Docente): Promise<{ data: Asignacion[]; totalRows: number }>;
    findByNivelMateria(nivel: NivelMateria, periodo: PeriodoAcademico): Promise<{ data: Asignacion[]; totalRows: number }>;
    findAll(
        page: number,
        limit: number,
        search: string,
    ): Promise<{ data: Asignacion[]; totalRows: number }>;
    findByPeriodo(periodo: PeriodoAcademico): Promise<{ data: Asignacion[]; totalRows: number }>;
    findByMateria(periodo: PeriodoAcademico, nivelMateria: NivelMateria, materia: string, jornada: Jornada): Promise<{ data: Asignacion[]; totalRows: number }>;
    findByDocenteSinMatricula(docente: Docente): Promise<{ data: Asignacion[]; totalRows: number }>;
    findBySinMatricula(/*matricula: Matricula*/): Promise<{ data: Asignacion[]; totalRows: number }>;
    delete(id: number): Promise<void>;
}