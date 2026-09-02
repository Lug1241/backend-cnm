export enum NivelMatricula {
  PRIMERO_BASICO_ELEMENTAL = '1ro Básico Elemental',
  SEGUNDO_BASICO_ELEMENTAL = '2do Básico Elemental',
  PRIMERO_BASICO_MEDIO = '1ro Básico Medio',
  SEGUNDO_BASICO_MEDIO = '2do Básico Medio',
  TERCERO_BASICO_MEDIO = '3ro Básico Medio',
  PRIMERO_BASICO_SUPERIOR = '1ro Básico Superior',
  SEGUNDO_BASICO_SUPERIOR = '2do Básico Superior',
  TERCERO_BASICO_SUPERIOR = '3ro Básico Superior',
  PRIMERO_BACHILLERATO = '1ro Bachillerato',
  SEGUNDO_BACHILLERATO = '2do Bachillerato',
  TERCERO_BACHILLERATO = '3ro Bachillerato',
}

export enum EstadoMatricula {
  APROBADO = 'Aprobado',
  REPROBADO = 'Reprobado',
  EN_CURSO = 'En curso',
}

export class Matricula {
  id!: number;
  nivel!: NivelMatricula;
  estado!: EstadoMatricula;
  estudianteId!: number;
  periodoAcademicoId!: number;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<Matricula>) {
    Object.assign(this, partial);
  }
}
