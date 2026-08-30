export enum GeneroEstudiante {
  MASCULINO = 'Masculino',
  FEMENINO = 'Femenino',
}

export enum JornadaEstudiante {
  MATUTINA = 'Matutina',
  VESPERTINA = 'Vespertina',
}

export enum GrupoEtnicoEstudiante {
  INDIGENA = 'Indígena',
  MESTIZO = 'Mestizo',
  AFRO_DESCENDIENTE = 'Afro-descendiente',
  NEGRO = 'Negro',
  BLANCO = 'Blanco',
}

export enum NivelEstudiante {
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
  GRADUADO = 'Graduado',
}

export class Estudiante {
  id?: number;
  nroCedula!: string;
  primerNombre!: string;
  segundoNombre!: string;
  primerApellido!: string;
  segundoApellido!: string;
  cedulaPdf?: string | null;
  genero!: GeneroEstudiante;
  anioMatricula!: number;
  jornada!: JornadaEstudiante;
  fechaNacimiento!: string;
  grupoEtnico!: GrupoEtnicoEstudiante;
  especialidad!: string;
  nroMatricula!: number;
  nacionalidad!: string;
  ier!: string;
  matriculaIerPdf?: string | null;
  direccion!: string;
  nivel!: NivelEstudiante;
  nroCedulaRepresentante!: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<Estudiante>) {
    Object.assign(this, partial);
  }
}
