import {
  CalificacionesLote,
  Calificacion,
  DatosCalificacion,
  EtapaCalificacion,
  TipoPlantilla,
} from '../entities/calificacion.entity';

export const I_CALIFICACION_REPOSITORY = 'ICalificacionRepository';

export interface ICalificacionRepository {
  findRegistros(inscripcionIds: number[]): Promise<Calificacion[]>;
  guardar(
    inscripcionId: number,
    etapa: EtapaCalificacion,
    tipoPlantilla: TipoPlantilla,
    datos: DatosCalificacion,
  ): Promise<Calificacion>;
  findByInscripcionIds(inscripcionIds: number[]): Promise<CalificacionesLote>;
}
