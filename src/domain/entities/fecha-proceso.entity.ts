export enum TipoProceso {
  MATRICULA = 'matricula',
  ACTUALIZACION_DATOS = 'actualizacion_datos',
  FECHAS_NOTAS = 'fechas_notas',
}

export enum DescripcionFechaNota {
  PARCIAL1_QUIM1 = 'parcial1_quim1',
  PARCIAL2_QUIM1 = 'parcial2_quim1',
  QUIMESTRE1 = 'quimestre1',
  PARCIAL1_QUIM2 = 'parcial1_quim2',
  PARCIAL2_QUIM2 = 'parcial2_quim2',
  QUIMESTRE2 = 'quimestre2',
  NOTA_FINAL = 'nota_final',
}

export class FechaProceso {
  id?: number;
  fechaInicio!: string;
  fechaFin!: string;
  proceso!: TipoProceso;
  descripcion?: string | null;

  constructor(partial: Partial<FechaProceso>) {
    Object.assign(this, partial);
  }
}
