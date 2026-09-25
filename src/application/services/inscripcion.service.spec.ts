import { InscripcionService } from './inscripcion.service';

describe('InscripcionService - Administración Escolar', () => {
  it('combina y deduplica estudiantes de varias asignaciones', async () => {
    const inscripcionRepository = {
      findByAsignacion: jest.fn(),
    };

    const asignacionRepository = {};
    const estudianteRepository = {
      findByIds: jest.fn(),
    };

    const service = new InscripcionService(
      inscripcionRepository as any,
      asignacionRepository as any,
      estudianteRepository as any,
    );

    inscripcionRepository.findByAsignacion
      .mockResolvedValueOnce([
        {
          id: 100,
          matricula: {
            estudianteId: 1,
            nivel: '1ro Básico Medio',
          },
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 101,
          matricula: {
            estudianteId: 1,
            nivel: '1ro Básico Medio',
          },
        },
        {
          id: 102,
          matricula: {
            estudianteId: 2,
            nivel: '2do Básico Medio',
          },
        },
      ]);

    estudianteRepository.findByIds.mockResolvedValue([
      {
        id: 1,
        primerApellido: 'Pérez',
        segundoApellido: 'Mora',
        primerNombre: 'Ana',
        segundoNombre: '',
      },
      {
        id: 2,
        primerApellido: 'Zambrano',
        segundoApellido: '',
        primerNombre: 'Carlos',
        segundoNombre: '',
      },
    ]);

    const resultado = await service.getEstudiantesPorAsignaciones([50, 51]);

    expect(resultado).toHaveLength(2);

    expect(resultado[0]).toMatchObject({
      nro: 1,
      idEstudiante: 1,
      nombreCompleto: 'Pérez Mora Ana',
      idAsignaciones: [50, 51],
      idInscripciones: [100, 101],
    });

    expect(resultado[1]).toMatchObject({
      nro: 2,
      idEstudiante: 2,
      nombreCompleto: 'Zambrano Carlos',
      idAsignaciones: [51],
      idInscripciones: [102],
    });

    expect(inscripcionRepository.findByAsignacion).toHaveBeenCalledTimes(2);

    expect(estudianteRepository.findByIds).toHaveBeenCalledWith([1, 2]);
  });
});
