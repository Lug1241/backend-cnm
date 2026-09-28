import { FechaProceso, TipoProceso } from '../entities/fecha-proceso.entity';

export const I_FECHA_PROCESO_REPOSITORY = 'IFechaProcesoRepository';

export interface IFechaProcesoRepository {
  create(fechaProceso: Partial<FechaProceso>): Promise<FechaProceso>;
  findById(id: number, proceso?: TipoProceso): Promise<FechaProceso | null>;
  findAll(
    page: number,
    limit: number,
    procesos?: TipoProceso[],
  ): Promise<{ data: FechaProceso[]; totalRows: number }>;
  update(
    id: number,
    fechaProceso: Partial<FechaProceso>,
  ): Promise<FechaProceso>;
  delete(id: number, proceso?: TipoProceso): Promise<void>;
  findLatestByProceso(proceso: TipoProceso): Promise<FechaProceso | null>;
  existsByProcesoAndDescripcion(
    proceso: TipoProceso,
    descripcion: string,
    excludeId?: number,
  ): Promise<boolean>;
}
