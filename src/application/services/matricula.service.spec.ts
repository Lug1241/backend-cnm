import { MatriculaService } from './matricula.service';
import { NivelMatricula } from '@domain/entities/matricula.entity';

describe('MatriculaService - niveles por período', () => {
  it('devuelve únicamente los niveles matriculados en orden académico', async () => {
    const matriculaRepository = {
      existePeriodo: jest.fn().mockResolvedValue(true),
      findNivelesByPeriodo: jest.fn().mockResolvedValue([
        NivelMatricula.TERCERO_BACHILLERATO,
        NivelMatricula.PRIMERO_BASICO_ELEMENTAL,
        NivelMatricula.SEGUNDO_BASICO_MEDIO,
        NivelMatricula.PRIMERO_BASICO_ELEMENTAL,
      ]),
    };
    const service = new MatriculaService(matriculaRepository as any);

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
    const service = new MatriculaService(matriculaRepository as any);

    await expect(service.getNivelesByPeriodo(999)).rejects.toThrow(
      'Período académico no encontrado',
    );
    expect(matriculaRepository.findNivelesByPeriodo).not.toHaveBeenCalled();
  });
});
