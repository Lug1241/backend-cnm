import { IsEnum, IsInt, Max, Min } from 'class-validator';
import {
  EstadoMatricula,
  NivelMatricula,
} from '@domain/entities/matricula.entity';

export class CreateMatriculaDto {
  @IsEnum(NivelMatricula, { message: 'El nivel de matrícula no es válido' })
  nivel!: NivelMatricula;

  @IsEnum(EstadoMatricula, { message: 'El estado de matrícula no es válido' })
  estado!: EstadoMatricula;

  @IsInt({ message: 'El ID del estudiante debe ser un número entero' })
  @Min(1)
  @Max(2147483647)
  ID_estudiante!: number;

  @IsInt({ message: 'El ID del período académico debe ser un número entero' })
  @Min(1)
  @Max(2147483647)
  ID_periodo_academico!: number;
}
