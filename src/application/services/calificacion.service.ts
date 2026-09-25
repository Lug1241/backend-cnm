import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  I_CALIFICACION_REPOSITORY,
  type ICalificacionRepository,
} from '@domain/interfaces/calificacion.repository.interface';
import {
  I_INSCRIPCION_REPOSITORY,
  type IInscripcionRepository,
} from '@domain/interfaces/inscripcion.repository.interface';
import {
  I_ESTUDIANTE_REPOSITORY,
  type IEstudianteRepository,
} from '@domain/interfaces/estudiante.repository.interface';
import {
  CalificacionParcial,
  CalificacionParcialBe,
  CalificacionesLote,
  ParcialCalificacion,
  QuimestreCalificacion,
} from '@domain/entities/calificacion.entity';
import { NivelMatricula } from '@domain/entities/matricula.entity';
import { Inscripcion } from '@domain/entities/inscripcion.entity';
import {
  calcularFinalBe,
  calcularFinalSuperior,
  calcularParcialBe,
  calcularParcialSuperior,
  calcularQuimestreBe,
  calcularQuimestreSuperior,
} from '@domain/services/calificacion-calculator';

@Injectable()
export class CalificacionService {
  constructor(
    @Inject(I_CALIFICACION_REPOSITORY)
    private readonly calificacionRepository: ICalificacionRepository,

    @Inject(I_INSCRIPCION_REPOSITORY)
    private readonly inscripcionRepository: IInscripcionRepository,

    @Inject(I_ESTUDIANTE_REPOSITORY)
    private readonly estudianteRepository: IEstudianteRepository,
  ) {}

  async getReporteByMatricula(idMatricula: number) {
    this.validarId(idMatricula, 'matrícula');

    const inscripciones =
      await this.inscripcionRepository.findByMatricula(idMatricula);

    if (inscripciones.length === 0) {
      throw new NotFoundException(
        'No se encontraron inscripciones para esta matrícula',
      );
    }

    const idsInscripcion = inscripciones
      .map((inscripcion) => inscripcion.id)
      .filter((id): id is number => typeof id === 'number');

    const calificaciones =
      await this.calificacionRepository.findByInscripcionIds(idsInscripcion);

    const matricula = inscripciones[0].matricula;
    const estudiantes = matricula?.estudianteId
      ? await this.estudianteRepository.findByIds([matricula.estudianteId])
      : [];
    const estudiante = estudiantes[0] ?? null;

    const cursos = inscripciones
      .map((inscripcion) =>
        this.construirReporteCurso(inscripcion, calificaciones),
      )
      .sort((a, b) => a.asignatura.localeCompare(b.asignatura, 'es'));

    return {
      matricula: {
        id: idMatricula,
        nivel: matricula?.nivel ?? null,
        periodoAcademicoId: matricula?.periodoAcademicoId ?? null,
      },
      estudiante: estudiante
        ? {
            id: estudiante.id,
            nroCedula: estudiante.nroCedula,
            nombreCompleto: [
              estudiante.primerApellido,
              estudiante.segundoApellido,
              estudiante.primerNombre,
              estudiante.segundoNombre,
            ]
              .filter(Boolean)
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim(),
          }
        : null,
      cursos,
    };
  }

  async getReporteByAsignaciones(idsAsignacion: number[]) {
    const ids = [...new Set(idsAsignacion)];

    if (ids.length === 0) {
      throw new BadRequestException(
        'Debe proporcionar al menos una asignación',
      );
    }

    ids.forEach((id) => this.validarId(id, 'asignación'));

    const gruposInscripciones = await Promise.all(
      ids.map((idAsignacion) =>
        this.inscripcionRepository.findByAsignacion(idAsignacion),
      ),
    );

    const inscripciones = gruposInscripciones.flat();

    if (inscripciones.length === 0) {
      return {
        asignacionIds: ids,
        estudiantes: [],
      };
    }

    const idsInscripcion = inscripciones
      .map((inscripcion) => inscripcion.id)
      .filter((id): id is number => typeof id === 'number');

    const calificaciones =
      await this.calificacionRepository.findByInscripcionIds(idsInscripcion);

    const idsEstudiantes = [
      ...new Set(
        inscripciones
          .map((inscripcion) => inscripcion.matricula?.estudianteId)
          .filter((id): id is number => typeof id === 'number'),
      ),
    ];

    const estudiantes =
      await this.estudianteRepository.findByIds(idsEstudiantes);

    const estudiantesPorId = new Map(
      estudiantes.map((estudiante) => [estudiante.id, estudiante]),
    );

    const filas = inscripciones.map((inscripcion) => {
      const curso = this.construirReporteCurso(inscripcion, calificaciones);

      const estudiante = inscripcion.matricula?.estudianteId
        ? estudiantesPorId.get(inscripcion.matricula.estudianteId)
        : undefined;

      const nombreCompleto = estudiante
        ? [
            estudiante.primerApellido,
            estudiante.segundoApellido,
            estudiante.primerNombre,
            estudiante.segundoNombre,
          ]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim()
        : '';

      return {
        idInscripcion: curso.idInscripcion,
        idAsignacion: curso.idAsignacion,
        idMatricula: inscripcion.matricula?.id ?? null,
        idEstudiante:
          estudiante?.id ?? inscripcion.matricula?.estudianteId ?? null,
        nombreCompleto,
        nivel: inscripcion.matricula?.nivel ?? null,

        asignatura: curso.asignatura,
        tipoMateria: curso.tipoMateria,
        tipoCalificacion: curso.tipoCalificacion,
        docente: curso.docente,
        detalleParciales: curso.detalleParciales,

        quimestre1: curso.quimestre1,
        quimestre2: curso.quimestre2,
        final: curso.final,
      };
    });

    filas.sort((a, b) =>
      a.nombreCompleto.localeCompare(b.nombreCompleto, 'es'),
    );

    return {
      asignacionIds: ids,
      estudiantes: filas,
    };
  }

  private construirReporteCurso(
    inscripcion: Inscripcion,
    calificaciones: CalificacionesLote,
  ) {
    const idInscripcion = inscripcion.id;

    if (typeof idInscripcion !== 'number') {
      throw new BadRequestException(
        'Se encontró una inscripción sin identificador válido',
      );
    }

    const nivelMatricula = inscripcion.matricula?.nivel;
    const esBasicoElemental =
      nivelMatricula === NivelMatricula.PRIMERO_BASICO_ELEMENTAL ||
      nivelMatricula === NivelMatricula.SEGUNDO_BASICO_ELEMENTAL;

    const asignacion = inscripcion.asignacion;
    const materia = asignacion?.materia;
    const docente = asignacion?.docente;

    if (esBasicoElemental) {
      const parciales = calificaciones.parcialesBe.filter(
        (row) => row.inscripcionId === idInscripcion,
      );
      const quimestrales = calificaciones.quimestralesBe.filter(
        (row) => row.inscripcionId === idInscripcion,
      );

      const q1 = calcularQuimestreBe(
        parciales,
        quimestrales.find((row) => row.quimestre === QuimestreCalificacion.Q1),
        QuimestreCalificacion.Q1,
      );
      const q2 = calcularQuimestreBe(
        parciales,
        quimestrales.find((row) => row.quimestre === QuimestreCalificacion.Q2),
        QuimestreCalificacion.Q2,
      );

      return {
        idInscripcion,
        idAsignacion: asignacion?.id ?? null,
        asignatura: materia?.nombre ?? 'Sin materia',
        nivelMateria: materia?.nivel ?? null,
        tipoMateria: materia?.tipo ?? null,
        tipoCalificacion: 'BE' as const,
        docente: docente
          ? {
              id: docente.id ?? null,
              nombreCompleto: [docente.primerNombre, docente.primerApellido]
                .filter(Boolean)
                .join(' ')
                .trim(),
            }
          : null,
        detalleParciales: {
          q1: {
            p1: this.construirDetalleParcialBe(
              parciales,
              QuimestreCalificacion.Q1,
              ParcialCalificacion.P1,
            ),
            p2: this.construirDetalleParcialBe(
              parciales,
              QuimestreCalificacion.Q1,
              ParcialCalificacion.P2,
            ),
          },

          q2: {
            p1: this.construirDetalleParcialBe(
              parciales,
              QuimestreCalificacion.Q2,
              ParcialCalificacion.P1,
            ),
            p2: this.construirDetalleParcialBe(
              parciales,
              QuimestreCalificacion.Q2,
              ParcialCalificacion.P2,
            ),
          },
        },
        quimestre1: q1,
        quimestre2: q2,
        final: calcularFinalBe(q1, q2),
      };
    }

    const parciales = calificaciones.parciales.filter(
      (row) => row.inscripcionId === idInscripcion,
    );
    const quimestrales = calificaciones.quimestrales.filter(
      (row) => row.inscripcionId === idInscripcion,
    );
    const finalGuardado = calificaciones.finales.find(
      (row) => row.inscripcionId === idInscripcion,
    );

    const q1 = calcularQuimestreSuperior(
      parciales,
      quimestrales.find((row) => row.quimestre === QuimestreCalificacion.Q1),
      QuimestreCalificacion.Q1,
    );
    const q2 = calcularQuimestreSuperior(
      parciales,
      quimestrales.find((row) => row.quimestre === QuimestreCalificacion.Q2),
      QuimestreCalificacion.Q2,
    );

    return {
      idInscripcion,
      idAsignacion: asignacion?.id ?? null,
      asignatura: materia?.nombre ?? 'Sin materia',
      nivelMateria: materia?.nivel ?? null,
      tipoMateria: materia?.tipo ?? null,
      tipoCalificacion: 'Superior' as const,
      docente: docente
        ? {
            id: docente.id ?? null,
            nombreCompleto: [docente.primerNombre, docente.primerApellido]
              .filter(Boolean)
              .join(' ')
              .trim(),
          }
        : null,
      detalleParciales: {
        q1: {
          p1: this.construirDetalleParcialSuperior(
            parciales,
            QuimestreCalificacion.Q1,
            ParcialCalificacion.P1,
          ),
          p2: this.construirDetalleParcialSuperior(
            parciales,
            QuimestreCalificacion.Q1,
            ParcialCalificacion.P2,
          ),
        },

        q2: {
          p1: this.construirDetalleParcialSuperior(
            parciales,
            QuimestreCalificacion.Q2,
            ParcialCalificacion.P1,
          ),
          p2: this.construirDetalleParcialSuperior(
            parciales,
            QuimestreCalificacion.Q2,
            ParcialCalificacion.P2,
          ),
        },
      },
      quimestre1: q1,
      quimestre2: q2,
      final: calcularFinalSuperior(q1, q2, finalGuardado),
    };
  }

  private construirDetalleParcialSuperior(
    parciales: CalificacionParcial[],
    quimestre: QuimestreCalificacion,
    parcial: ParcialCalificacion,
  ) {
    const registro = parciales.find(
      (row) => row.quimestre === quimestre && row.parcial === parcial,
    );

    if (!registro) {
      return null;
    }

    const resultado = calcularParcialSuperior(registro);

    return {
      insumo1: registro.insumo1,
      insumo2: registro.insumo2,

      ponderacion70: resultado.ponderacion70,

      evaluacion: registro.evaluacion,

      ponderacion30: resultado.ponderacion30,

      promedioParcial: resultado.promedioParcial,

      criteriosComportamiento: registro.comportamiento ?? [],

      promedioComportamiento: resultado.comportamiento,

      valoracionComportamiento: resultado.valoracionComportamiento,
    };
  }

  private construirDetalleParcialBe(
    parciales: CalificacionParcialBe[],
    quimestre: QuimestreCalificacion,
    parcial: ParcialCalificacion,
  ) {
    const registro = parciales.find(
      (row) => row.quimestre === quimestre && row.parcial === parcial,
    );

    if (!registro) {
      return null;
    }

    const resultado = calcularParcialBe(registro);

    return {
      insumo1: registro.insumo1,
      insumo2: registro.insumo2,
      evaluacion: registro.evaluacion,
      mejoramiento: registro.mejoramiento,

      promedioInsumos: resultado.promedioInsumos,

      ponderacion70: resultado.ponderacion70,

      promedioMejora: resultado.promedioMejora,

      promedioSumativas: resultado.promedioSumativas,

      ponderacion30: resultado.ponderacion30,

      notaParcial: resultado.notaParcial,
    };
  }

  private validarId(id: number, nombre: string): void {
    if (!Number.isSafeInteger(id) || id < 1) {
      throw new BadRequestException(
        `El ID de ${nombre} debe ser un entero mayor que cero`,
      );
    }
  }
}
