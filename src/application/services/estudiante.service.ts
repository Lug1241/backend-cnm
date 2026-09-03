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
import {
  type IPeriodoAcademicoRepository,
  I_PERIODO_REPOSITORY,
} from '@domain/interfaces/periodo-academico.repository.interface';
import {
  Estudiante,
  type NivelEstudiante,
} from '@domain/entities/estudiante.entity';
import { CreateEstudianteDto } from '../dtos/estudiante/create-estudiante.dto';
import { UpdateEstudianteDto } from '../dtos/update-estudiante.dto';

@Injectable()
export class EstudianteService {
  constructor(
    @Inject(I_ESTUDIANTE_REPOSITORY)
    private readonly estudianteRepository: IEstudianteRepository,

    @Inject(I_REPRESENTANTE_REPOSITORY)
    private readonly representanteRepository: IRepresentanteRepository,

    @Inject(I_PERIODO_REPOSITORY)
    private readonly periodoRepository: IPeriodoAcademicoRepository,
  ) {}

  async create(dto: CreateEstudianteDto) {
    const estudianteExistente = await this.estudianteRepository.findByCedula(
      dto.nroCedula,
    );

    if (estudianteExistente) {
      throw new ConflictException('La cédula ya está registrada');
    }

    const representanteExistente = await this.representanteRepository.findByID(
      dto.ID_representante,
    );

    if (!representanteExistente) {
      throw new NotFoundException('Representante no encontrado');
    }

    const { ID_representante, ...datosEstudiante } = dto;

    const nuevoEstudiante = new Estudiante({
      ...datosEstudiante,
      representanteId: ID_representante,
      representanteCedula: representanteExistente.nroCedula,
      representante: representanteExistente,
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

    const { ID_representante, ...datosEstudiante } = dto;

    const datosAActualizar: Partial<Estudiante> = {
      ...datosEstudiante,
    };

    if (
      ID_representante !== undefined &&
      ID_representante !== estudianteActual.representanteId
    ) {
      const representanteExistente =
        await this.representanteRepository.findByID(ID_representante);

      if (!representanteExistente) {
        throw new NotFoundException('Representante no encontrado');
      }

      datosAActualizar.representanteId = ID_representante;
      datosAActualizar.representanteCedula = representanteExistente.nroCedula;
    }

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

  async getByRepresentanteCedula(nroCedula: string) {
    const estudiantes =
      await this.estudianteRepository.findByRepresentanteCedula(nroCedula);

    if (estudiantes.length === 0) {
      throw new NotFoundException(
        'No se encontraron estudiantes para este representante',
      );
    }

    return estudiantes;
  }

  async getByApellido(page: number, limit: number, search: string) {
    if (!search.trim()) {
      return {
        data: [],
        totalPages: 0,
        currentPage: page,
        totalRows: 0,
      };
    }

    const { data, totalRows } = await this.estudianteRepository.findByApellido(
      search,
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

  async getByNivel(nivel: NivelEstudiante, page?: number, limit?: number) {
    const { data, totalRows } = await this.estudianteRepository.findByNivel(
      nivel,
      page,
      limit,
    );

    if (page !== undefined && limit !== undefined) {
      return {
        data,
        totalPages: Math.ceil(totalRows / limit),
        currentPage: page,
        totalRows,
      };
    }

    if (data.length === 0) {
      throw new NotFoundException(
        'No se encontraron estudiantes para este nivel',
      );
    }

    return data;
  }

  async getByMatricula(
    nivel: NivelEstudiante,
    idPeriodo: number,
    page?: number,
    limit?: number,
  ) {
    const { data, totalRows } = await this.estudianteRepository.findByMatricula(
      nivel,
      idPeriodo,
      page,
      limit,
    );

    if (page !== undefined && limit !== undefined) {
      return {
        data,
        totalPages: Math.ceil(totalRows / limit),
        currentPage: page,
        totalRows,
      };
    }

    if (data.length === 0) {
      throw new NotFoundException(
        'No se encontró ningún estudiante para este nivel y período',
      );
    }

    return data;
  }

  async verificarCedulaActualizada(nroCedula: string) {
    const estudiante = await this.getByCedula(nroCedula);
    const periodoActivo = await this.periodoRepository.findActive();

    if (!periodoActivo) {
      throw new NotFoundException({
        message: 'No hay un período académico activo',
        datosActualizados: false,
      });
    }

    const anioLectivo = periodoActivo.descripcion
      .trim()
      .replace(/^per[ií]odo\s*/i, '')
      .trim();

    const nombreArchivo = estudiante.cedulaPdf
      ?.trim()
      .replace(/\\/g, '/')
      .split('/')
      .pop();

    const datosActualizados = Boolean(
      anioLectivo &&
      nombreArchivo
        ?.toLowerCase()
        .endsWith(`_${anioLectivo.toLowerCase()}.pdf`),
    );

    return {
      datosActualizados,
      message: datosActualizados
        ? 'El estudiante tiene los documentos actualizados'
        : 'El estudiante debe actualizar la cedula antes de matricularse',
    };
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
