import { Inscripcion } from "../entities/inscripcion.entity";
import { PeriodoAcademico } from "@domain/entities/periodo-academico.entity";
import { NivelMateria } from "@domain/entities/materia.entity";

export const I_INSCRIPCION_REPOSITORY = 'I_INSCRIPCION_REPOSITORY';

export interface IInscripcionRepository {
    create(inscripcion: Inscripcion): Promise<Inscripcion>;
    update(id: number, inscripcion: Partial<Inscripcion>): Promise<boolean>;
    findById(id: number): Promise<Inscripcion | null>;
    delete(id: number): Promise<void>;

    findByAsignacion(idAsignacion: number): Promise<Inscripcion[]>; // Para getEstudiantesPorAsignacion
    findByMatricula(idMatricula: number): Promise<Inscripcion[]>; // Para getInscripcionesByMatricula
    
    findIndividualesByDocente(
        idDocente: string, 
        periodo: PeriodoAcademico, 
        skip: number, 
        limit: number
    ): Promise<{ data: Inscripcion[]; totalRows: number }>;
    
    findIndividualesByNivel(
        niveles: NivelMateria[], 
        periodo: PeriodoAcademico, 
        skip: number, 
        limit: number
    ): Promise<{ data: Inscripcion[]; totalRows: number }>;
    
    checkInscripcionDuplicada(idAsignacion: number, idMatricula: number): Promise<boolean>;
    checkInscripcionMateriaOtroDocente(idMateria: number, idMatricula: number): Promise<boolean>;

}