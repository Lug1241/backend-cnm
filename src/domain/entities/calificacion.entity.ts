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

export type EstadoCalificacionFinal =
  | 'Aprobado'
  | 'Supletorio'
  | 'Reprobado';
