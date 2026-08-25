import { Docente } from '../entities/docente.entity';

export const I_DOCENTE_REPOSITORY = 'IDocenteRepository';

export interface IDocenteRepository {
  create(docente: Docente): Promise<Docente>;
  update(nroCedula: string, docente: Partial<Docente>): Promise<boolean>;
  updatePassword(nroCedula: string, hashedPw: string): Promise<boolean>;
  findByCedula(nroCedula: string): Promise<Docente | null>;
  findByEmail(email: string): Promise<Docente | null>;
  findAll(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ data: Docente[]; totalRows: number }>;
  delete(nroCedula: string): Promise<void>;
}
