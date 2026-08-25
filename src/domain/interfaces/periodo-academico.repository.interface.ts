import { PeriodoAcademico } from '../entities/periodo-academico.entity';

export const I_PERIODO_REPOSITORY = 'IPeriodoAcademicoRepository';

export interface IPeriodoAcademicoRepository {
  create(periodo: PeriodoAcademico): Promise<PeriodoAcademico>;
  update(id: number, periodo: Partial<PeriodoAcademico>): Promise<boolean>;
  findById(id: number): Promise<PeriodoAcademico | null>;
  findByDescripcion(descripcion: string): Promise<PeriodoAcademico | null>;
  findActive(): Promise<PeriodoAcademico | null>;
  findAll(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ data: PeriodoAcademico[]; totalRows: number }>;
  delete(id: number): Promise<void>;
}
