import { PartialType } from '@nestjs/mapped-types';
import { CreateDocenteDto } from './create-docente.dto';
import { IsString, Length, IsOptional, Matches } from 'class-validator';

export class UpdateDocenteDto extends PartialType(CreateDocenteDto) {
  @IsOptional()
  @IsString()
  @Length(8, 100, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message:
      'La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial',
  })
  password?: string;
}
