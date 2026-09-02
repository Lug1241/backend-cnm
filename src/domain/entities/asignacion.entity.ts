import { Docente } from './docente.entity';
import { Materia } from './materia.entity';
import { PeriodoAcademico } from './periodo-academico.entity';

export enum DiaSemana {
    LUNES = 'Lunes',
    MARTES = 'Martes',
    MIERCOLES = 'Miércoles',
    JUEVES = 'Jueves',
    VIERNES = 'Viernes',
    SABADO = 'Sábado',
    DOMINGO = 'Domingo',
}

export class Asignacion {
    id?: number;
    paralelo!: string;
    horaInicio!: string;
    horaFin!: string;
    hora1!: string;
    hora2!: string;
    dias!: DiaSemana[];
    cupos!: number;
    docente!: Docente;
    materia!: Materia;
    periodoAcademico!: PeriodoAcademico;

    constructor(partial: Partial<Asignacion>) {
        Object.assign(this, partial);
    }
}