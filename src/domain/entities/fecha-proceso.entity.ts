export enum TipoProceso {
  MATRICULA = 'matricula',
  ACTUALIZACION_DATOS = 'actualizacion_datos',
}

export class FechaProceso {
  constructor(
    public readonly id: number,
    public fechaProceso: Date,
    public proceso: TipoProceso,
    public descripcion?: string,
  ) {}
}