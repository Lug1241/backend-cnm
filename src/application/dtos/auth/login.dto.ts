import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'La cédula es obligatoria' })
  @IsString()
  nroCedula!: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString()
  password!: string;
}
