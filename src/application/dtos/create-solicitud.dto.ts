import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { DescripcionSolicitud } from '../../domain/entities/solicitud.entity';

export class CreateSolicitudDto {
  @IsString()
  @IsNotEmpty({ message: 'La cédula del docente no puede estar vacía' })
  nroCedulaDocente!: string;

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
