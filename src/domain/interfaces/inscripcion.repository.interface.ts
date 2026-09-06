import { Inscripcion } from "../entities/inscripcion.entity";

export const I_INSCRIPCION_REPOSITORY = 'I_INSCRIPCION_REPOSITORY';

export interface IInscripcionRepository {
    create(inscripcion: Inscripcion): Promise<Inscripcion>;
    update(id: number, inscripcion: Partial<Inscripcion>): Promise<boolean>;
    findById(id: number): Promise<Inscripcion | null>;
    delete(id: number): Promise<void>;

    findByAsignacion(idAsignacion: number): Promise<any[]>; // Para getEstudiantesPorAsignacion
    findByMatricula(idMatricula: number): Promise<Inscripcion[]>; // Para getInscripcionesByMatricula
    
    findIndividualesByDocente(idDocente: string, idPeriodo: number, page: number, limit: number): Promise<{ data: Inscripcion[]; totalRows: number }>;
    findIndividualesByNivel(nivel: string, idPeriodo: number, page: number, limit: number): Promise<{ data: Inscripcion[]; totalRows: number }>;
    
    checkInscripcionDuplicada(idAsignacion: number, idMatricula: number): Promise<boolean>;
    checkInscripcionMateriaOtroDocente(idMateria: number, idMatricula: number): Promise<boolean>;

}