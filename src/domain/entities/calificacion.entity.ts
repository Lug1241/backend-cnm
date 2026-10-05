export enum QuimestreCalificacion {
  Q1 = 'Q1',
  Q2 = 'Q2',
}

export enum ParcialCalificacion {
  P1 = 'P1',
  P2 = 'P2',
}

export interface CalificacionParcial {
  id: number;
  inscripcionId: number;
  insumo1: number;
  insumo2: number;
  evaluacion: number;
  comportamiento: number[];
  quimestre: QuimestreCalificacion | null;
  parcial: ParcialCalificacion | null;
}

export interface CalificacionQuimestral {
  id: number;
  inscripcionId: number;
  examen: number;
  quimestre: QuimestreCalificacion | null;
}

export interface CalificacionFinal {
  tipoPlantilla?: TipoPlantilla;
  id: number;
  inscripcionId: number;
  examenRecuperacion: number | null;
}

export interface CalificacionParcialBe {
  id: number;
  inscripcionId: number;
  insumo1: number;
  insumo2: number;
  evaluacion: number;
  mejoramiento: number | null;
  quimestre: QuimestreCalificacion | null;
  parcial: ParcialCalificacion | null;
}

export interface CalificacionQuimestralBe {
  id: number;
  inscripcionId: number;
  examen: number;
  quimestre: QuimestreCalificacion | null;
}

export interface CalificacionesLote {
  parciales: CalificacionParcial[];
  quimestrales: CalificacionQuimestral[];
  finales: CalificacionFinal[];
  parcialesBe: CalificacionParcialBe[];
  quimestralesBe: CalificacionQuimestralBe[];
}

export type EstadoCalificacionFinal = 'Aprobado' | 'Supletorio' | 'Reprobado';

export enum EtapaCalificacion {
  Q1_P1 = 'Q1_P1',
  Q1_P2 = 'Q1_P2',
  Q1_EXAMEN = 'Q1_EXAMEN',
  Q2_P1 = 'Q2_P1',
  Q2_P2 = 'Q2_P2',
  Q2_EXAMEN = 'Q2_EXAMEN',
  FINAL = 'FINAL',
}
export enum TipoPlantilla {
  GENERAL = 'GENERAL',
  BASICO_ELEMENTAL = 'BASICO_ELEMENTAL',
}
export interface Calificacion {
  id: number;
  inscripcionId: number;
  etapa: EtapaCalificacion;
  tipoPlantilla: TipoPlantilla;
  insumo1: number | null;
  insumo2: number | null;
  evaluacion: number | null;
  mejoramiento: number | null;
  comportamiento: number[] | null;
  notaExamen: number | null;
  createdAt: Date;
  updatedAt: Date;
}
export type DatosCalificacion = Pick<
  Calificacion,
  | 'insumo1'
  | 'insumo2'
  | 'evaluacion'
  | 'mejoramiento'
  | 'comportamiento'
  | 'notaExamen'
>;

export function seleccionarPlantilla(
  nivel: string | undefined,
  lote: CalificacionesLote,
  id: number,
): TipoPlantilla {
  if (
    lote.parciales.some((r) => r.inscripcionId === id) ||
    lote.quimestrales.some((r) => r.inscripcionId === id) ||
    lote.finales.some(
      (r) =>
        r.inscripcionId === id && r.tipoPlantilla === TipoPlantilla.GENERAL,
    )
  )
    return TipoPlantilla.GENERAL;
  if (
    lote.parcialesBe.some((r) => r.inscripcionId === id) ||
    lote.quimestralesBe.some((r) => r.inscripcionId === id) ||
    lote.finales.some(
      (r) =>
        r.inscripcionId === id &&
        r.tipoPlantilla === TipoPlantilla.BASICO_ELEMENTAL,
    )
  )
    return TipoPlantilla.BASICO_ELEMENTAL;
  return nivel === '1ro Básico Elemental' || nivel === '2do Básico Elemental'
    ? TipoPlantilla.BASICO_ELEMENTAL
    : TipoPlantilla.GENERAL;
}
