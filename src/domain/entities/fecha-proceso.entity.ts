export enum TipoProceso {
  MATRICULA = 'matricula',
  ACTUALIZACION_DATOS = 'actualizacion_datos',
}

export class FechaProceso {
    id?: number;
    fechaProceso!: Date;
    proceso!: TipoProceso;
    descripcion!: string;
  constructor(partial: Partial<FechaProceso>) {
    Object.assign(this, partial);
  }
}