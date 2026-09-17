export enum TipoProceso {
  MATRICULA = 'matricula',
  ACTUALIZACION_DATOS = 'actualizacion_datos',
  FECHAS_NOTAS = 'fechas_notas',
}

export class FechaProceso {
  id?: number;
  fechaInicio!: Date;
  fechaFin!: Date;
  proceso!: TipoProceso;
  descripcion?: string | null;

  constructor(partial: Partial<FechaProceso>) {
    Object.assign(this, partial);
  }
}
