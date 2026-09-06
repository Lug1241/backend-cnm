import { Asignacion } from "@domain/entities/asignacion.entity"; // Ajustar rutas
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
}