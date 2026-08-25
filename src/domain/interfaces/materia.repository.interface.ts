import { Materia, NivelMateria, TipoMateria } from '../entities/materia.entity';

export const I_MATERIA_REPOSITORY = 'IMateriaRepository';

export interface IMateriaRepository {
  create(materia: Materia): Promise<Materia>;
  update(id: number, materia: Partial<Materia>): Promise<boolean>;
  findById(id: number): Promise<Materia | null>;
  findByNombre(nombre: string): Promise<Materia | null>;
  findByNivel(nivel: NivelMateria): Promise<{ data: Materia[]; totalRows: number }>;
  findByTipo(tipo: TipoMateria): Promise<{ data: Materia[]; totalRows: number }>;
  findAll(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ data: Materia[]; totalRows: number }>;
  delete(id: number): Promise<void>;
}