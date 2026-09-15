import { NumericType } from 'typeorm/driver/mongodb/typings.js';
import { Docente } from './docente.entity';
import { Materia } from './materia.entity';
import { PeriodoAcademico } from './periodo-academico.entity';

export enum DiaSemana {
    LUNES = 'Lunes',
    MARTES = 'Martes',
    MIERCOLES = 'Miércoles',
    JUEVES = 'Jueves',
    VIERNES = 'Viernes',
}

export interface RangoHorario {
    inicio: number | null;
    fin: number | null;
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

    private toMin(hora: string | undefined | null): number | null {
        if (!hora) return null;
        const [h, m] = hora.split(':').map(Number);
        return h * 60 + m;
    }

    public obtenerRangoPorDia(dia: DiaSemana): RangoHorario | null {
        if (!this.dias) return null;
        
        const index = this.dias.indexOf(dia);
        if (index === -1) return null;

        const tieneSegundoHorario = this.hora1 && this.hora2;

        if (index === 0) {
            return {
                inicio: this.toMin(this.horaInicio),
                fin: this.toMin(this.horaFin)
            };
        }

        if (index === 1) {
            if (tieneSegundoHorario) {
                return {
                    inicio: this.toMin(this.hora1),
                    fin: this.toMin(this.hora2)
                };
            } else {
                return {
                    inicio: this.toMin(this.horaInicio),
                    fin: this.toMin(this.horaFin)
                };
            }
        }

        return null;
    }

    public tieneConflictoCon(otraAsignacion: Asignacion): boolean {
        if (!this.dias || !otraAsignacion.dias) return false;

        return this.dias.some(dia => {
            if (!otraAsignacion.dias.includes(dia)) return false;

            const rangoA = this.obtenerRangoPorDia(dia);
            const rangoB = otraAsignacion.obtenerRangoPorDia(dia);

            if (!rangoA || !rangoB) return false;
            if (rangoA.inicio == null || rangoA.fin == null) return false;
            if (rangoB.inicio == null || rangoB.fin == null) return false;

            return rangoA.inicio < rangoB.fin && rangoA.fin > rangoB.inicio;
        });
    }

    public tieneRangoHorarioValido(): boolean {
        if (!this.horaInicio || !this.horaFin) return false;

        const [inicioH, inicioM] = this.horaInicio.split(':').map(Number);
        const [finH, finM] = this.horaFin.split(':').map(Number);

        const minutosInicio = (inicioH * 60) + inicioM;
        const minutosFin = (finH * 60) + finM;

        return minutosFin > minutosInicio;
    }
}