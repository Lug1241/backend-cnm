import { Matricula } from '../entities/matricula.entity';

export const I_MATRICULA_REPOSITORY = 'IMatriculaRepository';

export interface IMatriculaRepository {
  create(matricula: Matricula): Promise<Matricula>;
  update(id: number, matricula: Partial<Matricula>): Promise<boolean>;
  delete(id: number): Promise<void>;
  findById(id: number): Promise<Matricula | null>;
  findByEstudianteYPeriodo(
    estudianteId: number,
    periodoAcademicoId: number,
  ): Promise<Matricula | null>;
  findPeriodosByEstudiante(
    estudianteId: number,
  ): Promise<Pick<Matricula, 'id' | 'nivel' | 'periodoAcademicoId'>[]>;
  existeEstudiante(id: number): Promise<boolean>;
  existePeriodo(id: number): Promise<boolean>;
}
