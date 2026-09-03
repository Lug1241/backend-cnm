import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import {
  type IPeriodoAcademicoRepository,
  I_PERIODO_REPOSITORY,
} from '../../domain/interfaces/periodo-academico.repository.interface';
import {
  PeriodoAcademico,
  EstadoPeriodo,
} from '../../domain/entities/periodo-academico.entity';
import { CreatePeriodoDto } from '../dtos/periodo/create-periodo.dto';
import { UpdatePeriodoDto } from '../dtos/update-periodo.dto';

@Injectable()
export class PeriodoAcademicoService {
  constructor(
    @Inject(I_PERIODO_REPOSITORY)
    private readonly periodoRepository: IPeriodoAcademicoRepository,
  ) {}

  async create(dto: CreatePeriodoDto): Promise<PeriodoAcademico> {
    const existe = await this.periodoRepository.findByDescripcion(
      dto.descripcion,
    );
    if (existe) {
      throw new ConflictException('Error la periodo ya existe');
    }

    if (dto.fechaFin <= dto.fechaInicio) {
      throw new BadRequestException(
        'La fecha fin debe ser mayor que la fecha de inicio',
      );
    }

    const nuevoPeriodo = new PeriodoAcademico(dto);
    const resultado = await this.periodoRepository.create(nuevoPeriodo);

    return resultado;
  }

  async update(id: number, dto: UpdatePeriodoDto): Promise<PeriodoAcademico> {
    const periodoActual = await this.periodoRepository.findById(id);
    if (!periodoActual) {
      throw new NotFoundException('Periodo no encontrado');
    }

    if (
      periodoActual.estado === EstadoPeriodo.FINALIZADO &&
      dto.estado === EstadoPeriodo.ACTIVO
    ) {
      throw new ConflictException(
        'Un periodo finalizado no puede volver a Activo',
      );
    }

    const fechaInicioEval = dto.fechaInicio ?? periodoActual.fechaInicio;
    const fechaFinEval = dto.fechaFin ?? periodoActual.fechaFin;

    if (fechaFinEval <= fechaInicioEval) {
      throw new BadRequestException(
        'La fecha fin debe ser mayor que la fecha de inicio',
      );
    }

    await this.periodoRepository.update(id, dto);
    const actualizado = await this.periodoRepository.findById(id);
    return actualizado!;
  }

  async getById(id: number): Promise<PeriodoAcademico> {
    const periodo = await this.periodoRepository.findById(id);
    if (!periodo) {
      throw new NotFoundException('Periodo no encontrado');
    }
    return periodo;
  }

  async getActive(): Promise<PeriodoAcademico> {
    const periodo = await this.periodoRepository.findActive();
    if (!periodo) {
      throw new NotFoundException('Periodo no encontrado');
    }
    return periodo;
  }

  async getAll(page: number, limit: number, search: string) {
    const { data, totalRows } = await this.periodoRepository.findAll(
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

  async delete(id: number): Promise<PeriodoAcademico> {
    const periodo = await this.periodoRepository.findById(id);
    if (!periodo) {
      throw new NotFoundException('Periodo no encontrado');
    }
    await this.periodoRepository.delete(id);
    return periodo;
  }
}
