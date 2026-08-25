import { IsString, IsNotEmpty, Length, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoPeriodo } from '@domain/entities/periodo-academico.entity';

export class CreatePeriodoDto {
  @IsString()
  @IsNotEmpty({ message: 'La descripción del periodo no puede ser vacía' })
  @Length(4, 50, {
    message: 'La descripción debe tener entre 4 y 50 caracteres',
  })
  descripcion!: string;

  @IsEnum(EstadoPeriodo)
  estado!: EstadoPeriodo;

  @Type(() => Date)
  @IsDate({ message: 'Debe ingresar una fecha válida' })
  fechaInicio!: Date;

  @Type(() => Date)
  @IsDate({ message: 'Debe ingresar una fecha válida' })
  fechaFin!: Date;
}
