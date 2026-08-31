import { IsDate, IsEnum, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoProceso } from '../../domain/entities/fecha-proceso.entity';

export class CreateFechaProcesoDto {
  @IsNotEmpty({ message: 'La fecha del proceso no puede estar vacía ni ser nula' })
  @Type( () => Date )
  @IsDate( { message: 'La fecha del proceso debe tener un formato válido' } )
  fechaProceso!: Date;

  @IsNotEmpty({ message: 'El nombre del proceso no puede estar vacía' })
  @IsEnum(TipoProceso, { message: 'El proceso debe ser un valor válido (ej. matricula)' })
  proceso!: TipoProceso;

  @IsOptional()
  @IsString()
  descripcion?: string;
}