import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { TipoProceso } from '@domain/entities/fecha-proceso.entity';

export class CreateFechaProcesoDto {
  @IsNotEmpty({
    message: 'La fecha de inicio no puede estar vacía ni ser nula',
  })
  @IsDateString(
    {},
    { message: 'La fecha de inicio debe tener un formato válido' },
  )
  fechaInicio!: string;

  @IsNotEmpty({
    message: 'La fecha de fin no puede estar vacía ni ser nula',
  })
  @IsDateString({}, { message: 'La fecha de fin debe tener un formato válido' })
  fechaFin!: string;

  @IsNotEmpty({ message: 'El nombre del proceso no puede estar vacío' })
  @IsEnum(TipoProceso, {
    message: 'El proceso debe ser un valor válido',
  })
  proceso!: TipoProceso;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  descripcion?: string | null;
}
