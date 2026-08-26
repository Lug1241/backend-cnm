import { Docente } from './docente.entity';
export enum DescripcionSolicitud {
  PARCIAL1_QUIM1 = 'parcial1_quim1',
  PARCIAL2_QUIM1 = 'parcial2_quim1',
  QUIMESTRE1 = 'quimestre1',
  PARCIAL1_QUIM2 = 'parcial1_quim2',
  PARCIAL2_QUIM2 = 'parcial2_quim2',
  QUIMESTRE2 = 'quimestre2',
  NOTA_FINAL = 'nota_final',
}

export enum EstadoSolicitud {
  PENDIENTE = 'Pendiente',
  ACEPTADA = 'Aceptada',
  RECHAZADA = 'Rechazada',
}

export class Solicitud {
  id?: number;
  descripcion!: DescripcionSolicitud;
  fechaInicio!: Date | null;
  fechaFin!: Date | null;
  motivo!: string;
  estado!: EstadoSolicitud;
  fechaSolicitud!: Date;
  docente?: Docente;

  constructor(partial: Partial<Solicitud>) {
    Object.assign(this, partial);
  }
}
