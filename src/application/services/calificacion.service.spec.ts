import { CalificacionService } from './calificacion.service';
import {
  ParcialCalificacion,
  QuimestreCalificacion,
} from '@domain/entities/calificacion.entity';
import { NivelMatricula } from '@domain/entities/matricula.entity';

function crearDependencias() {
  const calificacionRepository = {
    findByInscripcionIds: jest.fn(),
  };
  const inscripcionRepository = {
    findByMatricula: jest.fn(),
  };
  const estudianteRepository = {
    findByIds: jest.fn(),
  };

  const service = new CalificacionService(
    calificacionRepository as any,
    inscripcionRepository as any,
    estudianteRepository as any,
  );

  return {
    service,
    calificacionRepository,
    inscripcionRepository,
    estudianteRepository,
  };
}

const asignacion = {
  id: 50,
  materia: {
    id: 10,
    nombre: 'Piano',
    nivel: '1ro BM',
    tipo: 'Individual',
  },
  docente: {
    id: 5,
    primerNombre: 'Ana',
    primerApellido: 'Pérez',
  },
};

const estudiante = {
  id: 9,
  nroCedula: '1234567890',
  primerNombre: 'Juan',
  segundoNombre: '',
  primerApellido: 'López',
  segundoApellido: 'Mora',
};

describe('CalificacionService', () => {
  it('arma el reporte superior por matrícula con Q1, Q2 y final', async () => {
    const {
      service,
      calificacionRepository,
      inscripcionRepository,
      estudianteRepository,
    } = crearDependencias();

    inscripcionRepository.findByMatricula.mockResolvedValue([
      {
        id: 100,
        matricula: {
          id: 20,
          nivel: NivelMatricula.PRIMERO_BASICO_MEDIO,
          estudianteId: 9,
          periodoAcademicoId: 3,
        },
        asignacion,
      },
    ]);
    estudianteRepository.findByIds.mockResolvedValue([estudiante]);
    calificacionRepository.findByInscripcionIds.mockResolvedValue({
      parciales: [
        ...[QuimestreCalificacion.Q1, QuimestreCalificacion.Q2].flatMap(
          (quimestre) => [
            {
              id: 1,
              inscripcionId: 100,
              insumo1: 8,
              insumo2: 8,
              evaluacion: 8,
              comportamiento: Array(10).fill(1),
              quimestre,
              parcial: ParcialCalificacion.P1,
            },
            {
              id: 2,
              inscripcionId: 100,
              insumo1: 8,
              insumo2: 8,
              evaluacion: 8,
              comportamiento: Array(10).fill(1),
              quimestre,
              parcial: ParcialCalificacion.P2,
            },
          ],
        ),
      ],
      quimestrales: [
        {
          id: 1,
          inscripcionId: 100,
          examen: 8,
          quimestre: QuimestreCalificacion.Q1,
        },
        {
          id: 2,
          inscripcionId: 100,
          examen: 8,
          quimestre: QuimestreCalificacion.Q2,
        },
      ],
      finales: [],
      parcialesBe: [],
      quimestralesBe: [],
    });

    const resultado = await service.getReporteByMatricula(20);

    expect(resultado.estudiante?.nombreCompleto).toBe('López Mora Juan');
    expect(resultado.cursos).toHaveLength(1);
    expect(resultado.cursos[0].tipoCalificacion).toBe('Superior');
    expect(resultado.cursos[0].quimestre1?.promedioQuimestral).toBeCloseTo(8);
    expect(resultado.cursos[0].final?.promedioFinal).toBeCloseTo(8);
    expect(resultado.cursos[0].final?.estado).toBe('Aprobado');
  });

  it('usa las tablas BE cuando la matrícula es de Básico Elemental', async () => {
    const {
      service,
      calificacionRepository,
      inscripcionRepository,
      estudianteRepository,
    } = crearDependencias();

    inscripcionRepository.findByMatricula.mockResolvedValue([
      {
        id: 100,
        matricula: {
          id: 20,
          nivel: NivelMatricula.PRIMERO_BASICO_ELEMENTAL,
          estudianteId: 9,
          periodoAcademicoId: 3,
        },
        asignacion,
      },
    ]);
    estudianteRepository.findByIds.mockResolvedValue([estudiante]);
    calificacionRepository.findByInscripcionIds.mockResolvedValue({
      parciales: [],
      quimestrales: [],
      finales: [],
      parcialesBe: [
        ...[QuimestreCalificacion.Q1, QuimestreCalificacion.Q2].flatMap(
          (quimestre) => [
            {
              id: 1,
              inscripcionId: 100,
              insumo1: 9,
              insumo2: 9,
              evaluacion: 9,
              mejoramiento: null,
              quimestre,
              parcial: ParcialCalificacion.P1,
            },
            {
              id: 2,
              inscripcionId: 100,
              insumo1: 9,
              insumo2: 9,
              evaluacion: 9,
              mejoramiento: null,
              quimestre,
              parcial: ParcialCalificacion.P2,
            },
          ],
        ),
      ],
      quimestralesBe: [
        {
          id: 1,
          inscripcionId: 100,
          examen: 9,
          quimestre: QuimestreCalificacion.Q1,
        },
        {
          id: 2,
          inscripcionId: 100,
          examen: 9,
          quimestre: QuimestreCalificacion.Q2,
        },
      ],
    });

    const resultado = await service.getReporteByMatricula(20);

    expect(resultado.cursos[0].tipoCalificacion).toBe('BE');
    expect(resultado.cursos[0].final?.promedioFinal).toBeCloseTo(9);
    expect(resultado.cursos[0].final?.estado).toBe('Aprobado');
  });
});
