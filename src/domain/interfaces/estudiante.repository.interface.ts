import {
  Estudiante,
  type NivelEstudiante,
} from '@domain/entities/estudiante.entity';

export const I_ESTUDIANTE_REPOSITORY = 'IEstudianteRepository';

export interface IEstudianteRepository {
  create(estudiante: Estudiante): Promise<Estudiante>;

  update(nroCedula: string, estudiante: Partial<Estudiante>): Promise<boolean>;

  findByCedula(nroCedula: string): Promise<Estudiante | null>;

  findByRepresentanteCedula(nroCedula: string): Promise<Estudiante[]>;

  findByApellido(
    apellido: string,
    page: number,
    limit: number,
  ): Promise<{ data: Estudiante[]; totalRows: number }>;

  findByNivel(
    nivel: NivelEstudiante,
    page?: number,
    limit?: number,
  ): Promise<{ data: Estudiante[]; totalRows: number }>;

  findAll(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ data: Estudiante[]; totalRows: number }>;

  delete(nroCedula: string): Promise<void>;
}
