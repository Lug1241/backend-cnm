export class Docente {
  id?: number;
  nroCedula!: string;
  primerNombre!: string;
  segundoNombre!: string;
  primerApellido!: string;
  segundoApellido!: string;
  celular!: string;
  email!: string;
  rol!: string;
  password!: string;
  debeCambiarPassword!: boolean;
  habilitado!: boolean;
  habilitadoHasta?: Date | null;
  resetToken?: string | null;
  resetTokenExpires?: Date | null;

  constructor(partial: Partial<Docente>) {
    Object.assign(this, partial);
  }
}
