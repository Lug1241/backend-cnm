import { CreateAsignacionDto } from '@application/dtos/asignacion/create-asignacion.dto';
import { UpdateAsignacionDto } from '@application/dtos/asignacion/update-asignacion.dto';
import { Asignacion } from '@domain/entities/asignacion.entity';
import { NivelMateria } from '@domain/entities/materia.entity';
import { PeriodoAcademico } from '@domain/entities/periodo-academico.entity';
import {
  I_ASIGNACION_REPOSITORY,
  type IAsignacionRepository,
} from '@domain/interfaces/asignacion.repository.interface';
import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { I_DOCENTE_REPOSITORY,
  type IDocenteRepository
 } from '@domain/interfaces/docente.repository.interface';

@Injectable()
export class AsignacionService {
  constructor(
    @Inject(I_ASIGNACION_REPOSITORY)
    private readonly asignacionRepository: IAsignacionRepository,

    @Inject(I_DOCENTE_REPOSITORY)
    private readonly docenteRepository: IDocenteRepository,
  ) {}

  async create(dto: CreateAsignacionDto): Promise<Asignacion> {
    //TODO: Se creó un método para encontrar por ID dado el cambio que se ejecutó antes en la BD
    //      de ser necesario se puede volver a cambiar el método para usar la cédula del docente
    const docente = (await this.docenteRepository.findByID(
      Number(dto.ID_docente)
    ));
    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    const asignacionesDocente =
      await this.asignacionRepository.findByDocente(docente);

    const asignacionesDelPeriodo = asignacionesDocente.data.filter(
      (asig) => asig.periodoAcademico?.id === dto.ID_periodo_academico,
    );

    const nuevaAsignacion = new Asignacion({
      paralelo: dto.paralelo,
      horaInicio: dto.horaInicio,
      horaFin: dto.horaFin,
      hora1: dto.hora1,
      hora2: dto.hora2,
      dias: dto.dias,
      cupos: dto.cupos,
      docente: docente,
      materia: { id: dto.ID_materia } as any,
      periodoAcademico: { id: dto.ID_periodo_academico } as any,
    });

    if (!nuevaAsignacion.tieneRangoHorarioValido()) {
      throw new BadRequestException('La hora de fin debe ser posterior a la hora de inicio.');
    }

    const conflicto = asignacionesDelPeriodo.some(asig => asig.tieneConflictoCon(nuevaAsignacion));

    if (conflicto) {
      throw new BadRequestException(
        'El docente ya tiene una asignación con cruce de horario en los días seleccionados para este período.',
      );
    }

    return this.asignacionRepository.create(nuevaAsignacion);
  }

  async update(id: number, dto: UpdateAsignacionDto): Promise<Asignacion> {
    const asignacionActual = await this.getById(id);

    const docente = (await this.docenteRepository.findByID(
      Number(dto.ID_docente),
    ));
    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    const asignacionesDocente =
      await this.asignacionRepository.findByDocente(docente);
    const asignacionesDelPeriodo = asignacionesDocente.data.filter(
      (asig) =>
        asig.periodoAcademico?.id === dto.ID_periodo_academico &&
        asig.id !== id,
    );

    const asignacionActualizada = new Asignacion({
      ...asignacionActual,
      paralelo: dto.paralelo,
      horaInicio: dto.horaInicio,
      horaFin: dto.horaFin,
      hora1: dto.hora1,
      hora2: dto.hora2,
      dias: dto.dias,
      cupos: dto.cupos,
      docente: docente,
      materia: { id: dto.ID_materia } as any,
      periodoAcademico: { id: dto.ID_periodo_academico } as any,
    });

    if (!asignacionActualizada.tieneRangoHorarioValido()) {
      throw new BadRequestException('La hora de fin debe ser posterior a la hora de inicio.');
    }

    const conflicto = asignacionesDelPeriodo.some(asig => asig.tieneConflictoCon(asignacionActualizada));

    if (conflicto) {
      throw new BadRequestException(
        'El docente ya tiene una asignación con cruce de horario en los días seleccionados para este período.',
      );
    }

    return this.asignacionRepository.update(id, asignacionActualizada);
  }

  async getById(id: number): Promise<Asignacion> {
    const asignacion = await this.asignacionRepository.findById(id);
    if (!asignacion) {
      throw new NotFoundException(`Asignación con ID ${id} no encontrada`);
    }
    return asignacion;
  }

  async delete(id: number): Promise<void> {
    await this.getById(id); // Valida que exista antes de eliminar
    await this.asignacionRepository.delete(id);
  }

  async getByDocente(id_docente: number) {
    const docente = (await this.docenteRepository.findByID(
      id_docente,
    ));
    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }
    return this.asignacionRepository.findByDocente(docente);
  }

  // Se eliminó getByNivelMateria

  async getAll(
    page: number,
    limit: number,
    search: string,
    id_periodo: number,
    grupo: string = '',
  ) {
    const skip = (page - 1) * limit;

    const gruposDict: Record<string, NivelMateria[]> = {
      'BE': [NivelMateria._1RO_BE, NivelMateria._2DO_BE],
      'BM': [NivelMateria._1RO_BM, NivelMateria._2DO_BM, NivelMateria._3RO_BM],
      'BS': [NivelMateria._1RO_BS, NivelMateria._2DO_BS, NivelMateria._3RO_BS],
      'BCH': [NivelMateria._1RO_BCH, NivelMateria._2DO_BCH, NivelMateria._3RO_BCH],
      'Agr': [NivelMateria.BM, NivelMateria.BS, NivelMateria.BCH, NivelMateria.BS_BCH,
        NivelMateria.BE, NivelMateria.BM_BS, NivelMateria.BM_BS_BCH,
      ],
    };

    const niveles: NivelMateria[] = grupo && gruposDict[grupo] ? gruposDict[grupo] : [];
    
    const periodoDummy = { id: id_periodo } as any; 

    const { data, totalRows } = await this.asignacionRepository.findAllPaginated(
      skip,
      limit,
      search,
      periodoDummy,
      niveles
    );

    const totalPages = Math.max(1, Math.ceil(totalRows / limit));

    return {
      data,
      totalRows,
      totalPages,
      currentPage: page,
    };
  }

  async getByPeriodo(id_periodo: number) {
    const periodoDummy = { id: id_periodo } as any;
    return this.asignacionRepository.findByPeriodo(periodoDummy);
  }

  async getByMateria(
    id_periodo: number,
    nivel: any,
    materia: string,
    jornada: any,
  ) {
    const periodoDummy = { id: id_periodo } as any;
    return this.asignacionRepository.findByMateria(
      periodoDummy,
      nivel,
      materia,
      jornada,
    );
  }

  async getSinMatricula(page: number, limit: number, idDocente?: number, periodo?: number) {  
    const skip = (page - 1) * limit;

    const { data, totalRows } = await this.asignacionRepository.findBySinMatricula(
      skip,
      limit,
      idDocente,
      periodo,
    );

    const totalPages = Math.max(1, Math.ceil(totalRows / limit));

    return {
      data,
      totalRows,
      totalPages,
      currentPage: page,
    };
  }
}
