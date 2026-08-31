import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Length,
  IsString,
} from 'class-validator';
import { DescripcionSolicitud } from '../../domain/entities/solicitud.entity';

export class CreateSolicitudDto {
  @IsNumber()
  @IsNotEmpty({ message: 'El ID del docente no puede estar vacío' })
  ID_docente!: number;

  @IsEnum(DescripcionSolicitud, {
    message: 'Debe seleccionar una descripción válida',
  })
  descripcion!: DescripcionSolicitud;

  @IsString()
  @IsNotEmpty({ message: 'El motivo no puede estar vacío' })
  @Length(2, 50, {
    message: 'El motivo debe tener entre 2 y 50 caracteres',
  })
  motivo!: string;

  @Type(() => Date)
  @IsDate({ message: 'Debe ingresar una fecha de solicitud válida' })
  fechaSolicitud!: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Debe ingresar una fecha de inicio válida' })
  fechaInicio?: Date | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Debe ingresar una fecha de fin válida' })
  fechaFin?: Date | null;
}
