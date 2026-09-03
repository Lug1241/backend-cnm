import {
  IsString,
  IsNotEmpty,
  Length,
  Matches,
  IsEmail,
} from 'class-validator';

export class CreateDocenteDto {
  @IsString()
  @IsNotEmpty({ message: 'La identificación es requerida' })
  @Matches(/^[0-9]{7,10}$/, {
    message: 'La identificación debe tener entre 7 y 10 dígitos numéricos',
  })
  nroCedula!: string;

  @IsString()
  @IsNotEmpty({ message: 'El primer nombre es requerido' })
  @Length(2, 50, {
    message: 'El primer nombre debe tener entre 2 y 50 caracteres',
  })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s/]+$/, {
    message:
      'El primer nombre solo puede contener letras, espacios y el símbolo /',
  })
  primerNombre!: string;

  @IsString()
  @IsNotEmpty({ message: 'El segundo nombre es requerido' })
  @Length(2, 50, {
    message: 'El segundo nombre debe tener entre 2 y 50 caracteres',
  })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s/]+$/, {
    message:
      'El segundo nombre solo puede contener letras, espacios y el símbolo /',
  })
  segundoNombre!: string;

  @IsString()
  @IsNotEmpty({ message: 'El primer apellido es requerido' })
  @Length(2, 50, {
    message: 'El primer apellido debe tener entre 2 y 50 caracteres',
  })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, {
    message: 'El primer apellido solo puede contener letras y espacios',
  })
  primerApellido!: string;

  @IsString()
  @IsNotEmpty({ message: 'El segundo apellido es requerido' })
  @Length(2, 50, {
    message: 'El segundo apellido debe tener entre 2 y 50 caracteres',
  })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s/]+$/, {
    message:
      'El segundo apellido solo puede contener letras, espacios y el símbolo /',
  })
  segundoApellido!: string;

  @IsString()
  @IsNotEmpty({ message: 'El celular es requerido' })
  @Matches(/^[0-9]{10}$/, {
    message: 'El celular debe tener exactamente 10 dígitos numéricos',
  })
  celular!: string;

  @IsString()
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'El rol es requerido' })
  @Length(2, 50, { message: 'El rol debe tener entre 2 y 50 caracteres' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s/]+$/, {
    message: 'El rol solo puede contener letras, espacios y el símbolo /',
  })
  rol!: string;
}
