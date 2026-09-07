import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateInscripcionDto {
    @IsNotEmpty({ message: 'El ID de la asignación es requerido' })
    @IsInt()
    @IsPositive()
    ID_asignacion!: number;

    @IsNotEmpty({ message: 'El ID de la matrícula es requerido' })
    @IsInt()
    @IsPositive()
    ID_matricula!: number;
}