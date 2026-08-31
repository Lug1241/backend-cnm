import {
  IsString,
  IsNotEmpty,
  Length,
  IsEnum,
  IsNumber,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import { NivelMateria, TipoMateria } from '@domain/entities/materia.entity';

export class CreateMateriaDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la materia no puede estar vacío' })
  @Length(2, 50, {
    message: 'El nombre de la materia debe tener entre 2 y 50 caracteres',
  })
  nombre!: string;

  @IsEnum(NivelMateria)
  nivel!: NivelMateria;

  @IsEnum(TipoMateria)
  tipo!: TipoMateria;

  @IsString()
  @IsOptional()
  observaciones!: string;

  @IsNumber()
  @IsNotEmpty({ message: 'No se permiten valores vacíos' })
  @IsInt({ message: 'Debe ser un número entero' })
  @Min(7, { message: 'La edad mínima debe ser al menos 7 años' })
  edadMin!: number;
}
