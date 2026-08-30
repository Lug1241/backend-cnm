import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  type IEstudianteRepository,
  I_ESTUDIANTE_REPOSITORY,
} from '@domain/interfaces/estudiante.repository.interface';
import {
  type IRepresentanteRepository,
  I_REPRESENTANTE_REPOSITORY,
} from '@domain/interfaces/representante.repository.interface';
import { Estudiante } from '@domain/entities/estudiante.entity';
import { CreateEstudianteDto } from '../dtos/create-estudiante.dto';
import { UpdateEstudianteDto } from '../dtos/update-estudiante.dto';

@Injectable()
export class EstudianteService {
  constructor(
    @Inject(I_ESTUDIANTE_REPOSITORY)
    private readonly estudianteRepository: IEstudianteRepository,

    @Inject(I_REPRESENTANTE_REPOSITORY)
    private readonly representanteRepository: IRepresentanteRepository,
  ) {}

  async create(dto: CreateEstudianteDto) {
    const estudianteExistente = await this.estudianteRepository.findByCedula(
      dto.nroCedula,
    );

    if (estudianteExistente) {
      throw new ConflictException('La cédula ya está registrada');
    }

    const representanteExistente =
      await this.representanteRepository.findByCedula(
        dto.nroCedulaRepresentante,
      );

    if (!representanteExistente) {
      throw new NotFoundException('Representante no encontrado');
    }

    const nuevoEstudiante = new Estudiante({
      ...dto,
      nroMatricula: dto.nroMatricula ?? 1,
    });

    return this.estudianteRepository.create(nuevoEstudiante);
  }

  async update(nroCedula: string, dto: UpdateEstudianteDto) {
    const estudianteActual =
      await this.estudianteRepository.findByCedula(nroCedula);

    if (!estudianteActual) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'No se proporcionaron datos para actualizar',
      );
    }

    let cedulaActualizada = nroCedula;

    if (dto.nroCedula && dto.nroCedula !== nroCedula) {
      const cedulaEnUso = await this.estudianteRepository.findByCedula(
        dto.nroCedula,
      );

      if (cedulaEnUso) {
        throw new ConflictException(
          'La nueva cédula ya está registrada por otro estudiante',
        );
      }

      cedulaActualizada = dto.nroCedula;
    }

    if (dto.nroCedulaRepresentante) {
      const representanteExistente =
        await this.representanteRepository.findByCedula(
          dto.nroCedulaRepresentante,
        );

      if (!representanteExistente) {
        throw new NotFoundException('Representante no encontrado');
      }
    }

    const datosAActualizar: Partial<Estudiante> = {
      ...dto,
    };

    const actualizado = await this.estudianteRepository.update(
      nroCedula,
      datosAActualizar,
    );

    if (!actualizado) {
      throw new NotFoundException('No se pudo actualizar el estudiante');
    }

    const estudianteActualizado =
      await this.estudianteRepository.findByCedula(cedulaActualizada);

    if (!estudianteActualizado) {
      throw new NotFoundException('Estudiante actualizado no encontrado');
    }

    return estudianteActualizado;
  }

  async getByCedula(nroCedula: string) {
    const estudiante = await this.estudianteRepository.findByCedula(nroCedula);

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return estudiante;
  }

  async getAll(page: number, limit: number, search: string) {
    const { data, totalRows } = await this.estudianteRepository.findAll(
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

  async delete(nroCedula: string) {
    const estudiante = await this.estudianteRepository.findByCedula(nroCedula);

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    await this.estudianteRepository.delete(nroCedula);

    return estudiante;
  }
}
