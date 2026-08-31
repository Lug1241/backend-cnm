import { IsDateString, IsEnum, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { TipoProceso } from '../../domain/entities/fecha-proceso.entity';

export class CreateFechaProcesoDto {
  @IsNotEmpty({ message: 'La fecha del proceso no puede estar vacía ni ser nula' })
  @IsDateString({}, { message: 'La fecha del proceso debe tener un formato válido' })
  fechaProceso!: string;

  @IsNotEmpty({ message: 'El nombre del proceso no puede estar vacía' })
  @IsEnum(TipoProceso, { message: 'El proceso debe ser un valor válido (ej. matricula)' })
  proceso!: TipoProceso;

  @IsOptional()
  @IsString()
  descripcion?: string;
}