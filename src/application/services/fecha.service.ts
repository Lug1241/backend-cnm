import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import type { IFechaProcesoRepository } from '../../domain/interfaces/fecha-proceso.interface';
import { CreateFechaProcesoDto } from '../dtos/create-fecha.dto';
import { FechaProceso, TipoProceso } from '../../domain/entities/fecha-proceso.entity';
import { UpdateFechaProcesoDto } from '@application/dtos/update-fecha.dto';

const I_FECHA_PROCESO_REPOSITORY = 'I_FECHA_PROCESO_REPOSITORY';

@Injectable()
export class FechaProcesoService {
  constructor(
    @Inject(I_FECHA_PROCESO_REPOSITORY)
    private readonly fechaProcesoRepository: IFechaProcesoRepository,
  ) {}

    async create(dto: CreateFechaProcesoDto) {
        return this.fechaProcesoRepository.create(dto as any);
    }

    async update(id: number, dto: UpdateFechaProcesoDto): Promise<FechaProceso> {
        await this.getById(id);
        await this.fechaProcesoRepository.update(id, dto);
        const actualizado = await this.fechaProcesoRepository.findById(id);
        return actualizado!;
    }

    async verificarPeriodoMatricula() {
        const hoy = new Date().toISOString().split('T')[0];
        const proceso = await this.fechaProcesoRepository.findLatestByProceso(TipoProceso.MATRICULA);

        if (!proceso) {
        return { periodoActivo: false, mensaje: 'No hay matrícula definida.' };
        }

        const fechaProcesoStr = typeof proceso.fechaProceso === 'string' 
        ? proceso.fechaProceso 
        : proceso.fechaProceso.toISOString().split('T')[0];

        const activo = hoy === fechaProcesoStr;

        return {
        periodoActivo: activo,
        proceso: proceso.proceso,
        fechaProceso: fechaProcesoStr,
        mensaje: activo ? 'La matrícula está activa hoy.' : 'La matrícula no está activa hoy.',
        };
    }
  
    async getById(id: number): Promise<FechaProceso> {
        const fechaProceso = await this.fechaProcesoRepository.findById(id);
        if (!fechaProceso) {
          throw new NotFoundException('Proceso no encontrado');
        }
        return fechaProceso;
    }

    async getAll(page: number = 1, limit: number = 10, search?: TipoProceso) {
        const { data, totalRows } = await this.fechaProcesoRepository.findAll(
          page,
          limit,
          search,
        );
        return {
          data,
          totalPages: Math.ceil(totalRows / limit),
          currentPage: page,
          totalRows,
        };
    }

    async delete (id: number): Promise<FechaProceso> {
        const fechaProceso = await this.getById(id);
        await this.fechaProcesoRepository.delete(id);
        return fechaProceso;
    }
}