import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  type IFechaProcesoRepository,
  I_FECHA_PROCESO_REPOSITORY,
} from '../../domain/interfaces/fecha-proceso.repository.interface';
import { CreateFechaProcesoDto } from '../dtos/fecha/create-fecha.dto';
import {
  DescripcionFechaNota,
  FechaProceso,
  TipoProceso,
} from '../../domain/entities/fecha-proceso.entity';
import { UpdateFechaProcesoDto } from '@application/dtos/fecha/update-fecha.dto';

@Injectable()
export class FechaProcesoService {
  constructor(
    @Inject(I_FECHA_PROCESO_REPOSITORY)
    private readonly fechaProcesoRepository: IFechaProcesoRepository,
  ) {}

  async create(dto: CreateFechaProcesoDto): Promise<FechaProceso> {
    await this.validarFechaProceso(dto);

    return this.fechaProcesoRepository.create(dto);
  }

  async update(id: number, dto: UpdateFechaProcesoDto): Promise<FechaProceso> {
    const actual = await this.getById(id);

    const datosActualizados = {
      fechaInicio: dto.fechaInicio ?? actual.fechaInicio,
      fechaFin: dto.fechaFin ?? actual.fechaFin,
      proceso: dto.proceso ?? actual.proceso,
      descripcion:
        dto.descripcion !== undefined ? dto.descripcion : actual.descripcion,
    };

    await this.validarFechaProceso(datosActualizados, id);

    return this.fechaProcesoRepository.update(id, dto);
  }

  async verificarPeriodoMatricula() {
    const hoy = this.obtenerFechaActual();

    const proceso = await this.fechaProcesoRepository.findLatestByProceso(
      TipoProceso.MATRICULA,
    );

    if (!proceso) {
      return {
        periodoActivo: false,
        mensaje: 'No hay matrícula definida.',
      };
    }

    const fechaInicio = this.formatearFecha(proceso.fechaInicio);
    const fechaFin = this.formatearFecha(proceso.fechaFin);

    const activo = hoy >= fechaInicio && hoy <= fechaFin;

    return {
      periodoActivo: activo,
      proceso: proceso.proceso,
      fechaInicio,
      fechaFin,
      mensaje: activo
        ? 'La matrícula está activa.'
        : 'La matrícula no está activa actualmente.',
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

  async delete(id: number): Promise<FechaProceso> {
    const fechaProceso = await this.getById(id);
    await this.fechaProcesoRepository.delete(id);
    return fechaProceso;
  }

  private validarRangoFechas(fechaInicio: Date, fechaFin: Date): void {
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser mayor que la fecha de fin.',
      );
    }
  }

  private formatearFecha(fecha: Date | string): string {
    if (typeof fecha === 'string') {
      return fecha.split('T')[0];
    }

    return fecha.toISOString().split('T')[0];
  }

  private obtenerFechaActual(): string {
    const hoy = new Date();

    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private async validarFechaProceso(
    datos: Pick<
      FechaProceso,
      'fechaInicio' | 'fechaFin' | 'proceso' | 'descripcion'
    >,
    excludeId?: number,
  ): Promise<void> {
    this.validarRangoFechas(datos.fechaInicio, datos.fechaFin);

    await this.validarDescripcionFechaNota(
      datos.proceso,
      datos.descripcion,
      excludeId,
    );
  }

  private async validarDescripcionFechaNota(
    proceso: TipoProceso,
    descripcion?: string | null,
    excludeId?: number,
  ): Promise<void> {
    if (proceso !== TipoProceso.FECHAS_NOTAS) {
      return;
    }

    if (!descripcion) {
      throw new BadRequestException(
        'La descripción es obligatoria para las fechas de notas.',
      );
    }

    const descripcionesValidas = Object.values(
      DescripcionFechaNota,
    ) as string[];

    if (!descripcionesValidas.includes(descripcion)) {
      throw new BadRequestException(
        'La descripción de la fecha de notas no es válida.',
      );
    }

    const existe =
      await this.fechaProcesoRepository.existsByProcesoAndDescripcion(
        proceso,
        descripcion,
        excludeId,
      );

    if (existe) {
      throw new BadRequestException(
        'Ya existe una fecha de notas con esta descripción.',
      );
    }
  }
}
