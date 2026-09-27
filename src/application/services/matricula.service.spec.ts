import { MatriculaService } from './matricula.service';
import { NivelMatricula } from '@domain/entities/matricula.entity';
import { type IMatriculaRepository } from '@domain/interfaces/matricula.repository.interface';
import { type EstudianteService } from './estudiante.service';

describe('MatriculaService - niveles por período', () => {
  it('devuelve únicamente los niveles matriculados en orden académico', async () => {
    const matriculaRepository = {
      existePeriodo: jest.fn().mockResolvedValue(true),
      findNivelesByPeriodo: jest
        .fn()
        .mockResolvedValue([
          NivelMatricula.TERCERO_BACHILLERATO,
          NivelMatricula.PRIMERO_BASICO_ELEMENTAL,
          NivelMatricula.SEGUNDO_BASICO_MEDIO,
          NivelMatricula.PRIMERO_BASICO_ELEMENTAL,
        ]),
    };
    const service = new MatriculaService(
      matriculaRepository as unknown as IMatriculaRepository,
      {} as EstudianteService,
    );

    await expect(service.getNivelesByPeriodo(3)).resolves.toEqual([
      NivelMatricula.PRIMERO_BASICO_ELEMENTAL,
      NivelMatricula.SEGUNDO_BASICO_MEDIO,
      NivelMatricula.TERCERO_BACHILLERATO,
    ]);
    expect(matriculaRepository.findNivelesByPeriodo).toHaveBeenCalledWith(3);
  });

  it('rechaza un período académico inexistente', async () => {
    const matriculaRepository = {
      existePeriodo: jest.fn().mockResolvedValue(false),
      findNivelesByPeriodo: jest.fn(),
    };
    const service = new MatriculaService(
      matriculaRepository as unknown as IMatriculaRepository,
      {} as EstudianteService,
    );

    await expect(service.getNivelesByPeriodo(999)).rejects.toThrow(
      'Período académico no encontrado',
    );
    expect(matriculaRepository.findNivelesByPeriodo).not.toHaveBeenCalled();
  });

  it('valida la pertenencia antes de devolver las matrículas al representante', async () => {
    const matriculaRepository = {
      findPeriodosByEstudiante: jest.fn().mockResolvedValue([
        {
          id: 20,
          estudianteId: 9,
          periodoAcademicoId: 3,
          nivel: NivelMatricula.SEGUNDO_BASICO_MEDIO,
        },
      ]),
    };
    const estudianteService = {
      verificarPertenenciaRepresentante: jest.fn().mockResolvedValue({ id: 9 }),
    };
    const service = new MatriculaService(
      matriculaRepository as unknown as IMatriculaRepository,
      estudianteService as unknown as EstudianteService,
    );

    await expect(
      service.getPeriodosByEstudianteForRepresentante(9, '1312797663'),
    ).resolves.toHaveLength(1);
    expect(
      estudianteService.verificarPertenenciaRepresentante,
    ).toHaveBeenCalledWith(9, '1312797663');
  });

  it('no consulta matrículas si el estudiante no pertenece al representante', async () => {
    const matriculaRepository = {
      findPeriodosByEstudiante: jest.fn(),
    };
    const estudianteService = {
      verificarPertenenciaRepresentante: jest
        .fn()
        .mockRejectedValue(new Error('No autorizado')),
    };
    const service = new MatriculaService(
      matriculaRepository as unknown as IMatriculaRepository,
      estudianteService as unknown as EstudianteService,
    );

    await expect(
      service.getPeriodosByEstudianteForRepresentante(9, '0000000000'),
    ).rejects.toThrow('No autorizado');
    expect(matriculaRepository.findPeriodosByEstudiante).not.toHaveBeenCalled();
  });
});
