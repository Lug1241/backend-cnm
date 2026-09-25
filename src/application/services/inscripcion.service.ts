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
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class InscripcionService {
    constructor(
        @Inject(I_INSCRIPCION_REPOSITORY)
        private readonly inscripcionRepository: IInscripcionRepository,
        
        @Inject(I_ASIGNACION_REPOSITORY)
        private readonly asignacionRepository: IAsignacionRepository,

        @Inject(I_ESTUDIANTE_REPOSITORY)
        private readonly estudianteRepository: IEstudianteRepository,

        private readonly dataSource: DataSource,
    ) {}

    async create(dto: CreateInscripcionDto, rolUsuario: string): Promise<Inscripcion> {
        const asignacionActual = await this.asignacionRepository.findById(dto.ID_asignacion);
        if (!asignacionActual) {
            throw new NotFoundException('Asignación no encontrada');
        }
        
        const materiaId = asignacionActual.materia?.id;
        if (materiaId == null) {
            throw new BadRequestException('La asignación no tiene una materia asociada');
        }

        const inscripcionesPrevias = await this.inscripcionRepository.findByMatricula(dto.ID_matricula);
        
        const nuevaInscripcion = new Inscripcion({
                asignacion: { id: dto.ID_asignacion } as Asignacion,
                matricula: { id: dto.ID_matricula } as Matricula
        });

        if (nuevaInscripcion.esDuplicada(inscripcionesPrevias)) {
            throw new BadRequestException("El estudiante ya está inscrito en esta materia");
        }

        const asignacionesPrevias = inscripcionesPrevias.map(insc => insc.asignacion);
        const conflicto = asignacionesPrevias.some(asig => asig.tieneConflictoCon(asignacionActual));
        if (conflicto) {
            throw new BadRequestException('Inscripción no válida por cruce de horarios');
        }

        const nombreMateria = asignacionActual.materia.nombre.toLowerCase();
        if (rolUsuario === 'representante' && this.esMateriaAgrupacion(nombreMateria)) {
            throw new BadRequestException('No se puede inscribir en esta materia, administración les asignará cupo después');
        }

        let idInscripcion: number;
        await this.dataSource.transaction(async (manager) => {
            const cupo = await this.descontarCupo(manager, dto.ID_asignacion);
            if (!cupo) {
                throw new BadRequestException('No hay cupos disponibles');
            }

            const result = await manager.query(
                'INSERT INTO inscripciones (ID_asignacion, ID_matricula) VALUES (?, ?)',
                [dto.ID_asignacion, dto.ID_matricula],
            );
            idInscripcion = result.insertId;
        });

        return (await this.inscripcionRepository.findById(idInscripcion!))!;

    }

    async update(id: number, dto: UpdateInscripcionDto, rolUsuario: string): Promise<boolean> {
        const inscripcionActual = await this.inscripcionRepository.findById(id);
        if (!inscripcionActual) {
            throw new NotFoundException('No se puede actualizar: la inscripción no existe o ya fue eliminada.');
        }

        const oldAsignacionId = inscripcionActual.asignacion?.id;
        const newAsignacionId = dto.ID_asignacion;

        if ((!newAsignacionId && !dto.ID_matricula) || oldAsignacionId === newAsignacionId) {
            let updated = false;
            await this.dataSource.transaction(async (manager) => {
                const result = await manager.query(
                    'UPDATE inscripciones SET ID_matricula = ? WHERE ID = ?',
                    [dto.ID_matricula ?? inscripcionActual.matricula.id, id],
                );
                updated = (result.affected ?? 0) > 0;
            });
            return updated;
        }

        if (!newAsignacionId) {
            throw new BadRequestException('Debe seleccionar una asignación válida');
        }

        const asignacionNueva = await this.asignacionRepository.findById(newAsignacionId);
        if (!asignacionNueva) {
            throw new NotFoundException('La nueva asignación no existe');
        }

        const nombreMateria = asignacionNueva.materia?.nombre?.toLowerCase() || '';
        
        if (rolUsuario === 'representante' && this.esMateriaAgrupacion(nombreMateria)) {
            throw new BadRequestException('No se puede cambiar a esta materia, administración les asignará cupo después');
        }

        let updated = false;
        await this.dataSource.transaction(async (manager) => {
            const cupo = await this.descontarCupo(manager, newAsignacionId);
            if (!cupo) {
                throw new BadRequestException('No hay cupos disponibles en la nueva asignación');
            }

            const result = await manager.query(
                'UPDATE inscripciones SET ID_asignacion = ?, ID_matricula = ? WHERE ID = ?',
                [newAsignacionId, dto.ID_matricula ?? inscripcionActual.matricula.id, id],
            );
            updated = (result.affected ?? 0) > 0;

            if (oldAsignacionId) {
                await manager.query(
                    'UPDATE asignaciones SET cupos = cupos + 1 WHERE ID = ?',
                    [oldAsignacionId],
                );
            }
        });

        return updated;
    }

    async getById(id: number): Promise<Inscripcion> {
        const inscripcion = await this.inscripcionRepository.findById(id);
        if (!inscripcion) {
            throw new NotFoundException('No se puede consultar: la inscripción no existe o ya fue eliminada.');
        }
        return inscripcion;
    }

    async delete(id: number, rolUsuario: string): Promise<void> {
        const inscripcion = await this.inscripcionRepository.findById(id);
        if (!inscripcion) {
            throw new NotFoundException('No se puede eliminar: la inscripción no existe o ya fue eliminada.');
        }

        const nombreMateria = inscripcion.asignacion?.materia?.nombre || "";

        if (rolUsuario === 'representante' && this.esMateriaAgrupacion(nombreMateria)) {
            throw new BadRequestException('No se puede borrar inscripciones de materias de agrupación');
        }

        await this.dataSource.transaction(async (manager) => {
            if (await this.tieneCalificaciones(manager, id)) {
                throw new BadRequestException(
                    'No se puede eliminar la inscripción porque tiene calificaciones registradas.',
                );
            }

            await manager.query('DELETE FROM inscripciones WHERE ID = ?', [id]);

            if (inscripcion.asignacion?.id) {
                await manager.query(
                    'UPDATE asignaciones SET cupos = cupos + 1 WHERE ID = ?',
                    [inscripcion.asignacion.id],
                );
            }
        });
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


    private esMateriaAgrupacion(nombreMateria: string | undefined): boolean {
        if(!nombreMateria) return false;

        return /ensamble|coro|banda|big band|audioperceptiva|orquesta pedagógica/i.test(nombreMateria);
    }

    private async descontarCupo(manager: EntityManager, idAsignacion: number): Promise<boolean> {
        const result = await manager.query(
            'UPDATE asignaciones SET cupos = cupos - 1 WHERE ID = ? AND cupos > 0',
            [idAsignacion],
        );
        return (result.affected ?? 0) > 0;
    }

    private async tieneCalificaciones(manager: EntityManager, idInscripcion: number): Promise<boolean> {
        const tablas = [
            'calificaciones_finales',
            'calificaciones_parciales',
            'calificaciones_parciales_be',
            'calificaciones_quimestrales',
            'calificaciones_quimestrales_be',
        ];

        for (const tabla of tablas) {
            const rows = await manager.query(
                `SELECT 1 FROM ${tabla} WHERE ID_inscripcion = ? LIMIT 1`,
                [idInscripcion],
            );
            if (rows.length > 0) return true;
        }

        return false;
    }
}