export class Representante {
  id?: number;
  nroCedula!: string;
  primerNombre!: string;
  segundoNombre!: string;
  primerApellido!: string;
  segundoApellido!: string;
  celular!: string;
  email!: string;
  cedulaPdf?: string | null;
  croquisPdf?: string | null;
  convencional!: string;
  emergencia!: string;
  password!: string;
  debeCambiarPassword!: boolean;
  resetToken?: string | null;
  resetTokenExpires?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<Representante>) {
    Object.assign(this, partial);
  }
}
