import { Asignacion } from "@domain/entities/asignacion.entity"; 
import { Matricula } from "@domain/entities/matricula.entity";

export class Inscripcion {
    id?: number;
    matricula!: Matricula;
    asignacion!: Asignacion;
    createdAt?: Date;
    updatedAt?: Date;

    constructor(partial: Partial<Inscripcion>) {
        Object.assign(this, partial);
    }

    public esDuplicada(inscripcionesPrevias: Inscripcion[]): boolean {
        if (!inscripcionesPrevias || inscripcionesPrevias.length === 0) return false;

        const materiaActual = this.asignacion?.materia?.id;
        if (!materiaActual) return false;

        return inscripcionesPrevias.some(insc =>
            insc.asignacion?.materia?.id === materiaActual
        );
    }
}