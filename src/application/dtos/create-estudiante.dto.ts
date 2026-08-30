import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import {
  GeneroEstudiante,
  GrupoEtnicoEstudiante,
  JornadaEstudiante,
  NivelEstudiante,
} from '@domain/entities/estudiante.entity';

export class CreateEstudianteDto {
  @IsString()
  @IsNotEmpty({ message: 'La identificación es requerida' })
  @Matches(/^[0-9]{7,10}$/, {
    message: 'La identificación debe tener entre 7 y 10 dígitos numéricos',
  })
  nroCedula!: string;

  @IsString()
  @IsNotEmpty({ message: 'El primer nombre es requerido' })
  @Length(2, 50, {
    message: 'El primer nombre debe tener entre 2 y 50 caracteres',
  })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s/]+$/, {
    message:
      'El primer nombre solo puede contener letras, espacios y el símbolo /',
  })
  primerNombre!: string;

  @IsString()
  @IsNotEmpty({ message: 'El segundo nombre es requerido' })
  @Length(2, 50, {
    message: 'El segundo nombre debe tener entre 2 y 50 caracteres',
  })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s/]+$/, {
    message:
      'El segundo nombre solo puede contener letras, espacios y el símbolo /',
  })
  segundoNombre!: string;

  @IsString()
  @IsNotEmpty({ message: 'El primer apellido es requerido' })
  @Length(2, 50, {
    message: 'El primer apellido debe tener entre 2 y 50 caracteres',
  })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, {
    message: 'El primer apellido solo puede contener letras y espacios',
  })
  primerApellido!: string;

  @IsString()
  @IsNotEmpty({ message: 'El segundo apellido es requerido' })
  @Length(2, 50, {
    message: 'El segundo apellido debe tener entre 2 y 50 caracteres',
  })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s/]+$/, {
    message:
      'El segundo apellido solo puede contener letras, espacios y el símbolo /',
  })
  segundoApellido!: string;

  @IsOptional()
  @IsString({ message: 'La cédula PDF debe ser una cadena de texto' })
  @MaxLength(255, {
    message: 'La ruta de la cédula PDF no puede superar 255 caracteres',
  })
  cedulaPdf?: string | null;

  @IsEnum(GeneroEstudiante, {
    message: 'El género no es válido',
  })
  genero!: GeneroEstudiante;

  @IsInt({ message: 'El año de matrícula debe ser un número entero' })
  @Min(1900, {
    message: 'El año de matrícula no es válido',
  })
  anioMatricula!: number;

  @IsEnum(JornadaEstudiante, {
    message: 'La jornada no es válida',
  })
  jornada!: JornadaEstudiante;

  @IsDateString(
    {},
    {
      message: 'La fecha de nacimiento debe ser una fecha válida',
    },
  )
  fechaNacimiento!: string;

  @IsEnum(GrupoEtnicoEstudiante, {
    message: 'El grupo étnico no es válido',
  })
  grupoEtnico!: GrupoEtnicoEstudiante;

  @IsString()
  @IsNotEmpty({ message: 'La especialidad es requerida' })
  @MaxLength(255, {
    message: 'La especialidad no puede superar 255 caracteres',
  })
  especialidad!: string;

  @IsOptional()
  @IsInt({ message: 'El número de matrícula debe ser un número entero' })
  @Min(1, {
    message: 'El número de matrícula debe ser mayor o igual a 1',
  })
  nroMatricula?: number;

  @IsString()
  @IsNotEmpty({ message: 'La nacionalidad es requerida' })
  @MaxLength(255, {
    message: 'La nacionalidad no puede superar 255 caracteres',
  })
  nacionalidad!: string;

  @IsString()
  @IsNotEmpty({
    message: 'La institución educativa de referencia es requerida',
  })
  @MaxLength(255, {
    message:
      'La institución educativa de referencia no puede superar 255 caracteres',
  })
  ier!: string;

  @IsOptional()
  @IsString({ message: 'La matrícula IER PDF debe ser una cadena de texto' })
  @MaxLength(255, {
    message: 'La ruta de la matrícula IER PDF no puede superar 255 caracteres',
  })
  matriculaIerPdf?: string | null;

  @IsString()
  @IsNotEmpty({ message: 'La dirección es requerida' })
  @MaxLength(255, {
    message: 'La dirección no puede superar 255 caracteres',
  })
  direccion!: string;

  @IsEnum(NivelEstudiante, {
    message: 'El nivel no es válido',
  })
  nivel!: NivelEstudiante;

  @IsString()
  @IsNotEmpty({ message: 'La identificación del representante es requerida' })
  @Matches(/^[0-9]{7,10}$/, {
    message:
      'La identificación del representante debe tener entre 7 y 10 dígitos numéricos',
  })
  nroCedulaRepresentante!: string;
}
