import { Representante } from '@domain/entities/representante.entity';

export const I_REPRESENTANTE_REPOSITORY = 'IRepresentanteRepository';

export interface IRepresentanteRepository {
  create(representante: Representante): Promise<Representante>;

  update(
    nroCedula: string,
    representante: Partial<Representante>,
  ): Promise<boolean>;

  updatePassword(nroCedula: string, hashedPassword: string): Promise<boolean>;

  findByCedula(nroCedula: string): Promise<Representante | null>;

  findByEmail(email: string): Promise<Representante | null>;
  findByID(id: number): Promise<Representante | null>;

  findAll(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ data: Representante[]; totalRows: number }>;

  delete(nroCedula: string): Promise<void>;
}
