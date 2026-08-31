import { FechaProceso, TipoProceso } from '../entities/fecha-proceso.entity';

export interface IFechaProcesoRepository {
  create(fechaProceso: Partial<FechaProceso>): Promise<FechaProceso>;
  findById(id: number): Promise<FechaProceso | null>;
  findAll(page: number, limit: number, proceso: TipoProceso): Promise<{ data: FechaProceso[]; totalRows: number }>;
  update(id: number, fechaProceso: Partial<FechaProceso>): Promise<FechaProceso>;
  delete(id: number): Promise<void>;
  findLatestByProceso(proceso: TipoProceso): Promise<FechaProceso | null>;
}