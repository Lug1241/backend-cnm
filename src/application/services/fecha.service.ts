import {
  Injectable,
  Inject,
  BadRequestException,
  ConflictException,
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
    const actual = await this.getById(id, dto.proceso);

    const datosActualizados = {
      fechaInicio: dto.fechaInicio ?? actual.fechaInicio,
      fechaFin: dto.fechaFin ?? actual.fechaFin,
      proceso: dto.proceso ?? actual.proceso,
      descripcion:
        dto.descripcion !== undefined ? dto.descripcion : actual.descripcion,
    };

    await this.validarFechaProceso(datosActualizados, id);

    return this.fechaProcesoRepository.update(id, datosActualizados);
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

  async getById(id: number, proceso?: TipoProceso): Promise<FechaProceso> {
    const fechaProceso = await this.fechaProcesoRepository.findById(
      id,
      proceso,
    );
    if (!fechaProceso) {
      throw new NotFoundException('Proceso no encontrado');
    }
    return fechaProceso;
  }

  async getAll(page: number = 1, limit: number = 10, search?: string) {
    const procesos = this.parseProcesos(search);

    const { data, totalRows } = await this.fechaProcesoRepository.findAll(
      page,
      limit,
      procesos,
    );
    return {
      data,
      totalPages: Math.ceil(totalRows / limit),
      currentPage: page,
      totalRows,
    };
  }

  async delete(id: number, proceso?: TipoProceso): Promise<FechaProceso> {
    const fechaProceso = await this.getById(id, proceso);
    await this.fechaProcesoRepository.delete(id, fechaProceso.proceso);
    return fechaProceso;
  }

  private parseProcesos(search?: string): TipoProceso[] | undefined {
    if (!search?.trim()) {
      return undefined;
    }

    const procesos = search
      .split(',')
      .map((proceso) => proceso.trim())
      .filter(Boolean);

    const procesosValidos = Object.values(TipoProceso) as string[];

    const procesosInvalidos = procesos.filter(
      (proceso) => !procesosValidos.includes(proceso),
    );

    if (procesosInvalidos.length > 0) {
      throw new BadRequestException(
        `Tipo de proceso no válido: ${procesosInvalidos.join(', ')}`,
      );
    }

    return [...new Set(procesos)] as TipoProceso[];
  }

  private validarRangoFechas(fechaInicio: string, fechaFin: string): void {
    if (fechaInicio > fechaFin) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser mayor que la fecha de fin.',
      );
    }
  }

  private formatearFecha(fecha: string): string {
    return fecha;
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
      throw new ConflictException(
        'Ya existe una fecha de notas con esta descripción.',
      );
    }
  }
}
