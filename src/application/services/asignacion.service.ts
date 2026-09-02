import { CreateAsignacionDto } from "@application/dtos/create-asignacion.dto";
import { Asignacion } from "@domain/entities/asignacion.entity";
import { 
    I_ASIGNACION_REPOSITORY, 
    type IAsignacionRepository 
} from "@domain/interfaces/asignacion.repository.interface";
import { Inject, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { DocenteService } from "./docente.service";
import { Docente } from "@domain/entities/docente.entity";

@Injectable()
export class AsignacionService {
    constructor(
        @Inject(I_ASIGNACION_REPOSITORY)
        private readonly asignacionRepository: IAsignacionRepository,
        private readonly docenteService: DocenteService
    ) {}

    async create(dto: CreateAsignacionDto): Promise<Asignacion> {
        //TODO: Se creó un método para encontrar por ID dado el cambio que se ejecutó antes en la BD
        //      de ser necesario se puede volver a cambiar el método para usar la cédula del docente
        const docente = await this.docenteService.getByID(Number(dto.ID_docente)) as Docente | null;
        if (!docente) {
            throw new NotFoundException("Docente no encontrado");
        }

        const asignacionesDocente = await this.asignacionRepository.findByDocente(docente);
        
        const asignacionesDelPeriodo = asignacionesDocente.data.filter(
            asig => asig.periodoAcademico?.id === dto.ID_periodo_academico
        );

        const conflicto = asignacionesDelPeriodo.some(asig => {
            return dto.dias.some(dia => {
                if (!asig.dias.includes(dia)) return false;

                const rangoNueva = this.obtenerRangoPorDia(dto, dia);
                const rangoExistente = this.obtenerRangoPorDia(asig, dia);

                return this.tienenHorariosSolapados(rangoNueva, rangoExistente);
            });
        });

        if (conflicto) {
            throw new BadRequestException(
                "El docente ya tiene una asignación con cruce de horario en los días seleccionados para este período."
            );
        }

        const nuevaAsignacion = new Asignacion({
            paralelo: dto.paralelo,
            horaInicio: dto.horaInicio,
            horaFin: dto.horaFin,
            hora1: dto.hora1,
            hora2: dto.hora2,
            dias: dto.dias,
            cupos: dto.cupos,
            docente: docente,
            materia: { id: dto.ID_materia } as any,
            periodoAcademico: { id: dto.ID_periodo_academico } as any
        });

        return this.asignacionRepository.create(nuevaAsignacion);
    }

    private toMin(hora: string | undefined): number | null {
        if (!hora) return null;
        const [h, m] = hora.split(":").map(Number);
        return h * 60 + m;
    }

    private obtenerRangoPorDia(asignacion: any, dia: string) {
        const index = asignacion.dias.indexOf(dia);
        if (index === -1) return null;

        const tieneSegundoHorario = asignacion.hora1 && asignacion.hora2;

        if (!tieneSegundoHorario) {
            return {
                inicio: this.toMin(asignacion.horaInicio),
                fin: this.toMin(asignacion.horaFin)
            };
        }

        if (index === 0) {
            return {
                inicio: this.toMin(asignacion.horaInicio),
                fin: this.toMin(asignacion.horaFin)
            };
        }

        if (index === 1) {
            return {
                inicio: this.toMin(asignacion.hora1),
                fin: this.toMin(asignacion.hora2)
            };
        }

        return null;
    }

    private tienenHorariosSolapados(rangoA: any, rangoB: any): boolean {
        if (!rangoA || !rangoB) return false;
        if (rangoA.inicio == null || rangoA.fin == null) return false;
        if (rangoB.inicio == null || rangoB.fin == null) return false;

        return rangoA.inicio < rangoB.fin && rangoA.fin > rangoB.inicio;
    }
}