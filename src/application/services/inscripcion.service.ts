import { Inject, 
    Injectable, 
    BadRequestException, 
    NotFoundException } from '@nestjs/common';
import { I_INSCRIPCION_REPOSITORY, 
    type IInscripcionRepository } from '@domain/interfaces/inscripcion.repository.interface';
import { CreateInscripcionDto } from '@application/dtos/inscripcion/create-inscripcion.dto';
import { UpdateInscripcionDto } from '@application/dtos/inscripcion/update-inscripcion.dto';
import { Inscripcion } from '@domain/entities/inscripcion.entity';
import { I_ASIGNACION_REPOSITORY, 
    type IAsignacionRepository } from '@domain/interfaces/asignacion.repository.interface';
import { I_ESTUDIANTE_REPOSITORY,
    type IEstudianteRepository } from '@domain/interfaces/estudiante.repository.interface';
import { Asignacion } from '@domain/entities/asignacion.entity';
import { DiaSemana } from '@domain/entities/asignacion.entity';
import { Matricula } from '@domain/entities/matricula.entity';
import { PeriodoAcademico } from '@domain/entities/periodo-academico.entity';
import { NivelMateria } from '@domain/entities/materia.entity';

interface RangoHorario {
    inicio: number | null;
    fin: number | null;
}

@Injectable()
export class InscripcionService {
    constructor(
        @Inject(I_INSCRIPCION_REPOSITORY)
        private readonly inscripcionRepository: IInscripcionRepository,
        
        @Inject(I_ASIGNACION_REPOSITORY)
        private readonly asignacionRepository: IAsignacionRepository,

        @Inject(I_ESTUDIANTE_REPOSITORY)
        private readonly estudianteRepository: IEstudianteRepository,
    ) {}

    async create(dto: CreateInscripcionDto, rolUsuario: string): Promise<Inscripcion> {
        const existeDuplicado = await this.inscripcionRepository.checkInscripcionDuplicada(dto.ID_asignacion, dto.ID_matricula);
        if (existeDuplicado) {
            throw new BadRequestException('El estudiante ya está inscrito en esta materia');
        }

        const asignacionActual = await this.asignacionRepository.findById(dto.ID_asignacion);
        if (!asignacionActual) {
            throw new NotFoundException('Asignación no encontrada');
        }

        const materiaId = asignacionActual.materia?.id;
        if (materiaId == null) {
            throw new BadRequestException('La asignación no tiene una materia asociada');
        }

        const inscritoEnMateria = await this.inscripcionRepository.checkInscripcionMateriaOtroDocente(
            materiaId,
            dto.ID_matricula
        );
        if (inscritoEnMateria) {
            throw new BadRequestException('El estudiante ya está inscrito en esta materia con otro profesor');
        }

        const nombreMateria = asignacionActual.materia.nombre.toLowerCase();
        if (rolUsuario === 'representante' && this.esMateriaAgrupacion(nombreMateria)) {
            throw new BadRequestException('No se puede inscribir en esta materia, administración les asignará cupo después');
        }

        const inscripcionesPrevias = await this.inscripcionRepository.findByMatricula(dto.ID_matricula);
        const asignacionesPrevias = inscripcionesPrevias.map(insc => insc.asignacion);

        const conflicto = asignacionesPrevias.some(asig => {
            return asignacionActual.dias.some((dia: DiaSemana) => {
                if (!asig.dias.includes(dia)) return false;

                const rangoNueva = this.obtenerRangoPorDia(asignacionActual, dia);
                const rangoExistente = this.obtenerRangoPorDia(asig, dia);

                return this.tienenHorariosSolapados(rangoNueva, rangoExistente);
            });
        });

        if (conflicto) {
            throw new BadRequestException('Inscripción no válida por cruce de horarios');
        }

        const cupoDescontado = await this.asignacionRepository.decrementarCupo(dto.ID_asignacion);
        if (!cupoDescontado) {
            throw new BadRequestException('No hay cupos disponibles');
        }

        try {
            const nuevaInscripcion = new Inscripcion({
                asignacion: { id: dto.ID_asignacion } as Asignacion,
                matricula: { id: dto.ID_matricula } as Matricula
            });

            return await this.inscripcionRepository.create(nuevaInscripcion);
        } catch (error) {
            await this.asignacionRepository.incrementarCupo(dto.ID_asignacion);
            throw error;
        }

    }

    async update(id: number, dto: UpdateInscripcionDto, rolUsuario: string): Promise<boolean> {
        const inscripcionActual = await this.inscripcionRepository.findById(id);
        if (!inscripcionActual) {
            throw new NotFoundException('Inscripción no encontrada');
        }

        const oldAsignacionId = inscripcionActual.asignacion?.id;
        const newAsignacionId = dto.ID_asignacion;

        if (!newAsignacionId || oldAsignacionId === newAsignacionId) {
            return await this.inscripcionRepository.update(id, {
                matricula: dto.ID_matricula ? { id: dto.ID_matricula } as Matricula : undefined
            });
        }

        const asignacionNueva = await this.asignacionRepository.findById(newAsignacionId);
        if (!asignacionNueva) {
            throw new NotFoundException('La nueva asignación no existe');
        }

        const nombreMateria = asignacionNueva.materia?.nombre?.toLowerCase() || '';
        
        if (rolUsuario === 'representante' && this.esMateriaAgrupacion(nombreMateria)) {
            throw new BadRequestException('No se puede cambiar a esta materia, administración les asignará cupo después');
        }

        const cupoDescontado = await this.asignacionRepository.decrementarCupo(newAsignacionId);
        if (!cupoDescontado) {
            throw new BadRequestException('No hay cupos disponibles en la nueva asignación');
        }

        try {
            const result = await this.inscripcionRepository.update(id, {
                asignacion: { id: newAsignacionId } as Asignacion,
                matricula: dto.ID_matricula ? { id: dto.ID_matricula } as Matricula : undefined
            });

            if (oldAsignacionId) {
                await this.asignacionRepository.incrementarCupo(oldAsignacionId);
            }

            return result;

        } catch (error) {
            await this.asignacionRepository.incrementarCupo(newAsignacionId);
            throw error;
        }
    }

    async getById(id: number): Promise<Inscripcion> {
        const inscripcion = await this.inscripcionRepository.findById(id);
        if (!inscripcion) {
            throw new NotFoundException('Inscripción no encontrada');
        }
        return inscripcion;
    }

    async delete(id: number, rolUsuario: string): Promise<void> {
        const inscripcion = await this.inscripcionRepository.findById(id);
        if (!inscripcion) {
            throw new NotFoundException('Inscripción no encontrada');
        }

        const nombreMateria = inscripcion.asignacion?.materia?.nombre || "";

        if (rolUsuario === 'representante' && this.esMateriaAgrupacion(nombreMateria)) {
            throw new BadRequestException('No se puede borrar inscripciones de materias de agrupación');
        }

        await this.inscripcionRepository.delete(id);

        if (inscripcion.asignacion?.id) {
            await this.asignacionRepository.incrementarCupo(inscripcion.asignacion.id);
        }
    }

    async getEstudiantesPorAsignacion(idAsignacion: number) {
        const inscripciones = await this.inscripcionRepository.findByAsignacion(idAsignacion);

        if (!inscripciones.length) return [];

        const idsEstudiantes = [...new Set(inscripciones.map(i => i.matricula?.estudianteId).filter(Boolean))];
        const estudiantesData = await this.estudianteRepository.findByIds(idsEstudiantes);

        return inscripciones.map(insc => {
            const estudiante = estudiantesData.find(e => e.id === insc.matricula?.estudianteId);
            if (!estudiante) return null;

            const nombreCompleto = [
                estudiante.primerApellido,
                estudiante.segundoApellido ?? '',
                estudiante.primerNombre,
                estudiante.segundoNombre ?? ''
            ].join(' ').replace(/\s+/g, ' ').trim();

            return {
                idInscripcion: insc.id,
                idEstudiante: estudiante.id,
                nombreCompleto,
                nivel: insc.matricula?.nivel || ""
            };
        })
        .filter(Boolean)
        .sort((a, b) => (a?.nombreCompleto || '').localeCompare(b?.nombreCompleto || ''))
        .map((est, index) => ({
            nro: index + 1,
            ...est
        }));
    }

    async getInscripcionesByMatricula(idMatricula: number) {
        const inscripciones = await this.inscripcionRepository.findByMatricula(idMatricula);

        return inscripciones.map(inscripcion => {
            const asignacion = inscripcion.asignacion;
            let rangoPorDia: Partial<Record<DiaSemana, { horaInicio: string, horaFin: string }>> | undefined = undefined;

            if (asignacion.dias && asignacion.dias.length === 2) {
                const primerDia = asignacion.dias[0];
                const segundoDia = asignacion.dias[1];
            
                rangoPorDia = {
                    [primerDia]: { horaInicio: asignacion.horaInicio, horaFin: asignacion.horaFin },
                    [segundoDia]: { horaInicio: asignacion.hora1, horaFin: asignacion.hora2 }
                };
            }

            return {
                ...inscripcion,
                asignacion: {
                    ...asignacion,
                    rangoPorDia
                }
            };
        });
    }

    async getInscripcionesIndividualesDocente(
        idDocente: string,
        idPeriodo: number,
        page: number, 
        limit: number
    ) {
        const skip = (page - 1) * limit;
        const periodoDummy = { id: idPeriodo } as PeriodoAcademico;

        const { data, totalRows } = await this.inscripcionRepository.findIndividualesByDocente(
            idDocente, 
            periodoDummy, 
            skip, 
            limit
        );

        const totalPages = Math.max(1, Math.ceil(totalRows / limit));

        return {
            data,
            totalRows,
            totalPages,
            currentPage: page,
        };
    }

    async getInscripcionesIndividualesByNivel(
      nivelStr: string, 
      periodoId: number, 
      page: number, 
      limit: number
    ) {
      const skip = (page - 1) * limit;

      const periodoDummy = { id: periodoId } as PeriodoAcademico;

      const nivelesDict: Record<string, NivelMateria[]> = {
        'BE': [NivelMateria._1RO_BE, NivelMateria._2DO_BE],
        'BM': [NivelMateria._1RO_BM, NivelMateria._2DO_BM, NivelMateria._3RO_BM],
        'BS': [NivelMateria._1RO_BS, NivelMateria._2DO_BS, NivelMateria._3RO_BS],
        'BCH': [NivelMateria._1RO_BCH, NivelMateria._2DO_BCH, NivelMateria._3RO_BCH],
      };

      const niveles = nivelesDict[nivelStr] || [nivelStr as NivelMateria];

      const { data, totalRows } = await this.inscripcionRepository.findIndividualesByNivel(
        niveles,
        periodoDummy,
        skip,
        limit
      );

      const totalPages = Math.max(1, Math.ceil(totalRows / limit));

      return {
        data,
        totalRows,
        totalPages,
        currentPage: page,
      };
    }

    private toMin(hora: string | undefined): number | null {
        if (!hora) return null;
        const [h, m] = hora.split(":").map(Number);
        return h * 60 + m;
    }

    private obtenerRangoPorDia(asignacion: Asignacion, dia: DiaSemana): RangoHorario | null {
        const index = asignacion.dias.indexOf(dia);
        if (index === -1) return null;

        const tieneSegundoHorario = asignacion.hora1 && asignacion.hora2;

        if (!tieneSegundoHorario || index === 0) {
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

    private tienenHorariosSolapados(rangoA: RangoHorario | null, rangoB: RangoHorario | null): boolean {
        if (!rangoA || !rangoB) return false;
        if (rangoA.inicio == null || rangoA.fin == null) return false;
        if (rangoB.inicio == null || rangoB.fin == null) return false;

        return rangoA.inicio < rangoB.fin && rangoA.fin > rangoB.inicio;
    }

    private esMateriaAgrupacion(nombreMateria: string | undefined): boolean {
        if(!nombreMateria) return false;

        return /ensamble|coro|banda|big band|audioperceptiva|orquesta pedagógica/i.test(nombreMateria);
    }
}