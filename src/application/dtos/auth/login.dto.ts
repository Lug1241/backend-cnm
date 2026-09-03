import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'La cédula es obligatoria' })
  @IsString()
  nroCedula!: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString()
  password!: string;

  @IsNotEmpty({ message: 'El tipo de usuario es obligatorio' })
  @IsIn(['docente', 'representante'], {
    message: 'El tipo de usuario debe ser "docente" o "representante"',
  })
  type!: 'docente' | 'representante';
}
