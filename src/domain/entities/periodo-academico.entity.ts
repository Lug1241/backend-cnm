export enum EstadoPeriodo {
  ACTIVO = 'Activo',
  FINALIZADO = 'Finalizado',
}

export class PeriodoAcademico {
  id?: number;
  descripcion!: string;
  estado!: EstadoPeriodo;
  fechaInicio!: Date;
  fechaFin!: Date;

  constructor(partial: Partial<PeriodoAcademico>) {
    Object.assign(this, partial);
  }
}
