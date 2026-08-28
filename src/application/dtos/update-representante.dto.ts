import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { CreateRepresentanteDto } from './create-representante.dto';

export class UpdateRepresentanteDto extends PartialType(
  CreateRepresentanteDto,
) {
  @IsOptional()
  @IsString()
  @Length(8, 100, {
    message: 'La contraseña debe tener al menos 8 caracteres',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message:
      'La contraseña debe contener una mayúscula, una minúscula, un número y un carácter especial',
  })
  password?: string;
}
