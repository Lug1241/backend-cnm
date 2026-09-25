import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  I_INSCRIPCION_REPOSITORY,
  type IInscripcionRepository,
} from '@domain/interfaces/inscripcion.repository.interface';
import { CreateInscripcionDto } from '@application/dtos/inscripcion/create-inscripcion.dto';
import { UpdateInscripcionDto } from '@application/dtos/inscripcion/update-inscripcion.dto';
import { Inscripcion } from '@domain/entities/inscripcion.entity';
import {
  I_ASIGNACION_REPOSITORY,
  type IAsignacionRepository,
} from '@domain/interfaces/asignacion.repository.interface';
import {
  I_ESTUDIANTE_REPOSITORY,
  type IEstudianteRepository,
} from '@domain/interfaces/estudiante.repository.interface';
import { Asignacion } from '@domain/entities/asignacion.entity';
import { DiaSemana } from '@domain/entities/asignacion.entity';
import { Matricula } from '@domain/entities/matricula.entity';
import { PeriodoAcademico } from '@domain/entities/periodo-academico.entity';
import { NivelMateria } from '@domain/entities/materia.entity';

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

  async create(
    dto: CreateInscripcionDto,
    rolUsuario: string,
  ): Promise<Inscripcion> {
    const asignacionActual = await this.asignacionRepository.findById(
      dto.ID_asignacion,
    );
    if (!asignacionActual) {
      throw new NotFoundException('Asignación no encontrada');
    }

    const materiaId = asignacionActual.materia?.id;
    if (materiaId == null) {
      throw new BadRequestException(
        'La asignación no tiene una materia asociada',
      );
    }

    const inscripcionesPrevias =
      await this.inscripcionRepository.findByMatricula(dto.ID_matricula);

    const nuevaInscripcion = new Inscripcion({
      asignacion: { id: dto.ID_asignacion } as Asignacion,
      matricula: { id: dto.ID_matricula } as Matricula,
    });

    if (nuevaInscripcion.esDuplicada(inscripcionesPrevias)) {
      throw new BadRequestException(
        'El estudiante ya está inscrito en esta materia',
      );
    }

    const asignacionesPrevias = inscripcionesPrevias.map(
      (insc) => insc.asignacion,
    );
    const conflicto = asignacionesPrevias.some((asig) =>
      asig.tieneConflictoCon(asignacionActual),
    );
    if (conflicto) {
      throw new BadRequestException(
        'Inscripción no válida por cruce de horarios',
      );
    }

    const nombreMateria = asignacionActual.materia.nombre.toLowerCase();
    if (
      rolUsuario === 'representante' &&
      this.esMateriaAgrupacion(nombreMateria)
    ) {
      throw new BadRequestException(
        'No se puede inscribir en esta materia, administración les asignará cupo después',
      );
    }

    const cupoDescontado = await this.asignacionRepository.decrementarCupo(
      dto.ID_asignacion,
    );
    if (!cupoDescontado) {
      throw new BadRequestException('No hay cupos disponibles');
    }

    try {
      return await this.inscripcionRepository.create(nuevaInscripcion);
    } catch (error) {
      await this.asignacionRepository.incrementarCupo(dto.ID_asignacion);
      throw error;
    }
  }

  async update(
    id: number,
    dto: UpdateInscripcionDto,
    rolUsuario: string,
  ): Promise<boolean> {
    const inscripcionActual = await this.inscripcionRepository.findById(id);
    if (!inscripcionActual) {
      throw new NotFoundException(
        'No se puede actualizar: la inscripción no existe o ya fue eliminada.',
      );
    }

    const oldAsignacionId = inscripcionActual.asignacion?.id;
    const newAsignacionId = dto.ID_asignacion;

    if (!newAsignacionId || oldAsignacionId === newAsignacionId) {
      return await this.inscripcionRepository.update(id, {
        matricula: dto.ID_matricula
          ? ({ id: dto.ID_matricula } as Matricula)
          : undefined,
      });
    }

    const asignacionNueva =
      await this.asignacionRepository.findById(newAsignacionId);
    if (!asignacionNueva) {
      throw new NotFoundException('La nueva asignación no existe');
    }

    const nombreMateria = asignacionNueva.materia?.nombre?.toLowerCase() || '';

    if (
      rolUsuario === 'representante' &&
      this.esMateriaAgrupacion(nombreMateria)
    ) {
      throw new BadRequestException(
        'No se puede cambiar a esta materia, administración les asignará cupo después',
      );
    }

    const cupoDescontado =
      await this.asignacionRepository.decrementarCupo(newAsignacionId);
    if (!cupoDescontado) {
      throw new BadRequestException(
        'No hay cupos disponibles en la nueva asignación',
      );
    }

    try {
      const result = await this.inscripcionRepository.update(id, {
        asignacion: { id: newAsignacionId } as Asignacion,
        matricula: dto.ID_matricula
          ? ({ id: dto.ID_matricula } as Matricula)
          : undefined,
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
      throw new NotFoundException(
        'No se puede consultar: la inscripción no existe o ya fue eliminada.',
      );
    }
    return inscripcion;
  }

  async delete(id: number, rolUsuario: string): Promise<void> {
    const inscripcion = await this.inscripcionRepository.findById(id);
    if (!inscripcion) {
      throw new NotFoundException(
        'No se puede eliminar: la inscripción no existe o ya fue eliminada.',
      );
    }

    const nombreMateria = inscripcion.asignacion?.materia?.nombre || '';

    if (
      rolUsuario === 'representante' &&
      this.esMateriaAgrupacion(nombreMateria)
    ) {
      throw new BadRequestException(
        'No se puede borrar inscripciones de materias de agrupación',
      );
    }

    await this.inscripcionRepository.delete(id);

    if (inscripcion.asignacion?.id) {
      await this.asignacionRepository.incrementarCupo(
        inscripcion.asignacion.id,
      );
    }
  }

  async getEstudiantesPorAsignacion(idAsignacion: number) {
    const inscripciones =
      await this.inscripcionRepository.findByAsignacion(idAsignacion);

    if (!inscripciones.length) return [];

    const idsEstudiantes = [
      ...new Set(
        inscripciones.map((i) => i.matricula?.estudianteId).filter(Boolean),
      ),
    ];
    const estudiantesData =
      await this.estudianteRepository.findByIds(idsEstudiantes);

    return inscripciones
      .map((insc) => {
        const estudiante = estudiantesData.find(
          (e) => e.id === insc.matricula?.estudianteId,
        );
        if (!estudiante) return null;

        const nombreCompleto = [
          estudiante.primerApellido,
          estudiante.segundoApellido ?? '',
          estudiante.primerNombre,
          estudiante.segundoNombre ?? '',
        ]
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        return {
          idInscripcion: insc.id,
          idEstudiante: estudiante.id,
          nombreCompleto,
          nivel: insc.matricula?.nivel || '',
        };
      })
      .filter(Boolean)
      .sort((a, b) =>
        (a?.nombreCompleto || '').localeCompare(b?.nombreCompleto || ''),
      )
      .map((est, index) => ({
        nro: index + 1,
        ...est,
      }));
  }

  async getEstudiantesPorAsignaciones(idsAsignacion: number[]) {
    const grupos = await Promise.all(
      idsAsignacion.map(async (idAsignacion) => ({
        idAsignacion,
        inscripciones:
          await this.inscripcionRepository.findByAsignacion(idAsignacion),
      })),
    );

    const idsEstudiantes = [
      ...new Set(
        grupos
          .flatMap(({ inscripciones }) => inscripciones)
          .map((inscripcion) => inscripcion.matricula?.estudianteId)
          .filter((id): id is number => typeof id === 'number'),
      ),
    ];

    if (idsEstudiantes.length === 0) {
      return [];
    }

    const estudiantesData =
      await this.estudianteRepository.findByIds(idsEstudiantes);

    const estudiantesPorId = new Map(
      estudiantesData.map((estudiante) => [estudiante.id, estudiante]),
    );

    const agrupados = new Map<
      number,
      {
        idEstudiante: number;
        nombreCompleto: string;
        nivel: string;
        idAsignaciones: number[];
        idInscripciones: number[];
      }
    >();

    for (const { idAsignacion, inscripciones } of grupos) {
      for (const inscripcion of inscripciones) {
        const idEstudiante = inscripcion.matricula?.estudianteId;

        if (typeof idEstudiante !== 'number') {
          continue;
        }

        const estudiante = estudiantesPorId.get(idEstudiante);

        if (!estudiante) {
          continue;
        }

        const nombreCompleto = [
          estudiante.primerApellido,
          estudiante.segundoApellido ?? '',
          estudiante.primerNombre,
          estudiante.segundoNombre ?? '',
        ]
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        const existente = agrupados.get(idEstudiante);

        if (existente) {
          if (!existente.idAsignaciones.includes(idAsignacion)) {
            existente.idAsignaciones.push(idAsignacion);
          }

          if (
            typeof inscripcion.id === 'number' &&
            !existente.idInscripciones.includes(inscripcion.id)
          ) {
            existente.idInscripciones.push(inscripcion.id);
          }

          continue;
        }

        agrupados.set(idEstudiante, {
          idEstudiante,
          nombreCompleto,
          nivel: inscripcion.matricula?.nivel ?? '',
          idAsignaciones: [idAsignacion],
          idInscripciones:
            typeof inscripcion.id === 'number' ? [inscripcion.id] : [],
        });
      }
    }

    return [...agrupados.values()]
      .sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto, 'es'))
      .map((estudiante, index) => ({
        nro: index + 1,
        ...estudiante,
      }));
  }

  async getInscripcionesByMatricula(idMatricula: number) {
    const inscripciones =
      await this.inscripcionRepository.findByMatricula(idMatricula);

    return inscripciones.map((inscripcion) => {
      const asignacion = inscripcion.asignacion;
      let rangoPorDia:
        | Partial<Record<DiaSemana, { horaInicio: string; horaFin: string }>>
        | undefined = undefined;

      if (asignacion.dias && asignacion.dias.length === 2) {
        const primerDia = asignacion.dias[0];
        const segundoDia = asignacion.dias[1];

        rangoPorDia = {
          [primerDia]: {
            horaInicio: asignacion.horaInicio,
            horaFin: asignacion.horaFin,
          },
          [segundoDia]: {
            horaInicio: asignacion.hora1,
            horaFin: asignacion.hora2,
          },
        };
      }

      return {
        ...inscripcion,
        asignacion: {
          ...asignacion,
          rangoPorDia,
        },
      };
    });
  }

  async getInscripcionesIndividualesDocente(
    idDocente: string,
    idPeriodo: number,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;
    const periodoDummy = { id: idPeriodo } as PeriodoAcademico;

    const { data, totalRows } =
      await this.inscripcionRepository.findIndividualesByDocente(
        idDocente,
        periodoDummy,
        skip,
        limit,
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
    limit: number,
  ) {
    const skip = (page - 1) * limit;

    const periodoDummy = { id: periodoId } as PeriodoAcademico;

    const nivelesDict: Record<string, NivelMateria[]> = {
      BE: [NivelMateria._1RO_BE, NivelMateria._2DO_BE],
      BM: [NivelMateria._1RO_BM, NivelMateria._2DO_BM, NivelMateria._3RO_BM],
      BS: [NivelMateria._1RO_BS, NivelMateria._2DO_BS, NivelMateria._3RO_BS],
      BCH: [
        NivelMateria._1RO_BCH,
        NivelMateria._2DO_BCH,
        NivelMateria._3RO_BCH,
      ],
    };

    const niveles = nivelesDict[nivelStr] || [nivelStr as NivelMateria];

    const { data, totalRows } =
      await this.inscripcionRepository.findIndividualesByNivel(
        niveles,
        periodoDummy,
        skip,
        limit,
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
    if (!nombreMateria) return false;

    return /ensamble|coro|banda|big band|audioperceptiva|orquesta pedagógica/i.test(
      nombreMateria,
    );
  }
}
