import { CalificacionesLote } from '../entities/calificacion.entity';

export const I_CALIFICACION_REPOSITORY = 'ICalificacionRepository';

export interface ICalificacionRepository {
  findByInscripcionIds(inscripcionIds: number[]): Promise<CalificacionesLote>;
}
