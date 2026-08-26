import { DescripcionSolicitud, Solicitud } from '../entities/solicitud.entity';

export const I_SOLICITUD_REPOSITORY = 'ISolicitudRepository';

export interface SolicitudDuplicateCriteria {
  ID_docente: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  motivo: string;
  descripcion: DescripcionSolicitud;
}

export interface ISolicitudRepository {
  create(solicitud: Solicitud): Promise<Solicitud>;
  update(id: number, solicitud: Partial<Solicitud>): Promise<boolean>;
  findById(id: number): Promise<Solicitud | null>;
  findDuplicate(
    criteria: SolicitudDuplicateCriteria,
  ): Promise<Solicitud | null>;
  findByDocente(nroCedulaDocente: string): Promise<Solicitud[]>;
  findAll(): Promise<Solicitud[]>;
  findLastAcceptedByDocente(
    nroCedulaDocente: string,
  ): Promise<Solicitud | null>;
  delete(id: number): Promise<void>;
}
