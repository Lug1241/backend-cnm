import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import {
  type IMateriaRepository,
  I_MATERIA_REPOSITORY,
} from '../../domain/interfaces/materia.repository.interface';
import {
  Materia,
  NivelMateria,
  TipoMateria,
} from '../../domain/entities/materia.entity';
import { CreateMateriaDto } from '../dtos/materia/create-materia.dto';
import { UpdateMateriaDto } from '../dtos/materia/update-materia.dto';

@Injectable()
export class MateriaService {
  constructor(
    @Inject(I_MATERIA_REPOSITORY)
    private readonly materiaRepository: IMateriaRepository,
  ) {}

  async create(dto: CreateMateriaDto): Promise<Materia> {
    const existe = await this.materiaRepository.findByNombre(dto.nombre);
    if (existe) {
      throw new ConflictException('Error la materia ya existe');
    }

    const nuevaMateria = new Materia(dto);
    const resultado = await this.materiaRepository.create(nuevaMateria);

    return resultado;
  }

  async update(id: number, dto: UpdateMateriaDto): Promise<Materia> {
    const materiaActual = await this.getById(id);
    if (dto.nombre) {
      const existe = await this.materiaRepository.findByNombre(dto.nombre);
      if (existe && existe.id != materiaActual.id) {
        throw new ConflictException('Error la materia ya existe');
      }
    }

    await this.materiaRepository.update(id, dto);
    const actualizado = await this.materiaRepository.findById(id);
    return actualizado!;
  }

  async getById(id: number): Promise<Materia> {
    const materia = await this.materiaRepository.findById(id);
    if (!materia) {
      throw new NotFoundException('Materia no encontrada');
    }
    return materia;
  }

  async getByName(nombre: string): Promise<Materia> {
    const materia = await this.materiaRepository.findByNombre(nombre);
    if (!materia) {
      throw new NotFoundException('Materia no encontrada');
    }
    return materia;
  }

  async getAll(page: number = 1, limit: number = 10, search: string = '') {
    const { data, totalRows } = await this.materiaRepository.findAll(
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

  async getByLevel(nivel: NivelMateria, page: number = 1, limit: number = 10) {
    const { data, totalRows } = await this.materiaRepository.findByNivel(
      nivel,
      page,
      limit,
    );
    return {
      data,
      totalPages: Math.ceil(totalRows / limit),
      currentPage: page,
      totalRows,
    };
  }

  async getByType(tipo: TipoMateria, page: number = 1, limit: number = 10) {
    const { data, totalRows } = await this.materiaRepository.findByTipo(
      tipo,
      page,
      limit,
    );
    return {
      data,
      totalPages: Math.ceil(totalRows / limit),
      currentPage: page,
      totalRows,
    };
  }

  async delete(id: number): Promise<Materia> {
    const materia = await this.getById(id);
    await this.materiaRepository.delete(id);
    return materia;
  }
}
