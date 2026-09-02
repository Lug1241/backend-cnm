import { 
  IsNotEmpty, 
  IsString, 
  Length, 
  Matches, 
  IsArray, 
  IsEnum, 
  ArrayMinSize, 
  ArrayMaxSize, 
  IsInt, 
  IsOptional 
} from "class-validator";
import { DiaSemana } from "@domain/entities/asignacion.entity"; // Ajusta la ruta

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export class CreateAsignacionDto {
    @IsString()
    @IsNotEmpty({ message: 'El paralelo es requerido' })
    @Length(1, 50, { message: 'El paralelo debe tener entre 1 y 50 caracteres' })
    paralelo!: string;

    @IsString()
    @IsNotEmpty({ message: 'La hora de inicio es requerida' })
    @Matches(timeRegex, { message: 'La hora de inicio debe estar en formato HH:MM o HH:MM:SS' })
    horaInicio!: string;

    @IsString()
    @IsNotEmpty({ message: 'La hora de fin es requerida' })
    @Matches(timeRegex, { message: 'La hora de fin debe estar en formato HH:MM o HH:MM:SS' })
    horaFin!: string;

    @IsOptional()
    @IsString()
    @Matches(timeRegex, { message: 'La hora 1 debe estar en formato HH:MM o HH:MM:SS' })
    hora1?: string;

    @IsOptional()
    @IsString()
    @Matches(timeRegex, { message: 'La hora 2 debe estar en formato HH:MM o HH:MM:SS' })
    hora2?: string;

    @IsArray({ message: 'El campo dias debe ser un array' })
    @ArrayMinSize(1, { message: 'Debe seleccionar entre 1 y 2 días' })
    @ArrayMaxSize(2, { message: 'Debe seleccionar entre 1 y 2 días' })
    @IsEnum(DiaSemana, { each: true, message: 'Día no válido' })
    dias!: DiaSemana[];

    @IsInt({ message: 'Los cupos deben ser un número entero' })
    @IsNotEmpty({ message: 'No se permiten valores nulos en cupos' })
    cupos!: number;

    @IsInt()
    @IsNotEmpty()
    ID_periodo_academico!: number;

    @IsInt()
    @IsNotEmpty()
    ID_materia!: number;

    @IsString()
    @IsNotEmpty()
    ID_docente!: string; //TODO: se espera que el nuevo front corrija el cambio que se hizo de la cedula por un PK autoincremental
}