import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Matricula } from '@domain/entities/matricula.entity';
import {
  I_MATRICULA_REPOSITORY,
  type IMatriculaRepository,
} from '@domain/interfaces/matricula.repository.interface';
import { CreateMatriculaDto } from '../dtos/create-matricula.dto';
import { UpdateMatriculaDto } from '../dtos/update-matricula.dto';

@Injectable()
export class MatriculaService {
  constructor(
    @Inject(I_MATRICULA_REPOSITORY)
    private readonly matriculaRepository: IMatriculaRepository,
  ) {}

  async create(dto: CreateMatriculaDto): Promise<Matricula> {
    await this.validarReferencias(dto.ID_estudiante, dto.ID_periodo_academico);
    await this.validarDuplicado(dto.ID_estudiante, dto.ID_periodo_academico);

    return this.matriculaRepository.create(
      new Matricula({
        nivel: dto.nivel,
        estado: dto.estado,
        estudianteId: dto.ID_estudiante,
        periodoAcademicoId: dto.ID_periodo_academico,
      }),
    );
  }

  async update(id: number, dto: UpdateMatriculaDto): Promise<Matricula> {
    const actual = await this.getById(id);
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'No se proporcionaron datos para actualizar',
      );
    }

    const estudianteId = dto.ID_estudiante ?? actual.estudianteId;
    const periodoAcademicoId =
      dto.ID_periodo_academico ?? actual.periodoAcademicoId;
    await this.validarReferencias(estudianteId, periodoAcademicoId);
    await this.validarDuplicado(estudianteId, periodoAcademicoId, id);

    const actualizado = await this.matriculaRepository.update(id, {
      nivel: dto.nivel,
      estado: dto.estado,
      estudianteId: dto.ID_estudiante,
      periodoAcademicoId: dto.ID_periodo_academico,
    });
    if (!actualizado) {
      throw new NotFoundException('Matrícula no encontrada');
    }
    return this.getById(id);
  }

  async getById(id: number): Promise<Matricula> {
    this.validarId(id);
    const matricula = await this.matriculaRepository.findById(id);
    if (!matricula) {
      throw new NotFoundException('Matrícula no encontrada');
    }
    return matricula;
  }

  async getByEstudianteYPeriodo(
    estudianteId: number,
    periodoAcademicoId: number,
  ): Promise<Matricula | null> {
    this.validarId(estudianteId);
    this.validarId(periodoAcademicoId);
    return this.matriculaRepository.findByEstudianteYPeriodo(
      estudianteId,
      periodoAcademicoId,
    );
  }

  async getPeriodosByEstudiante(estudianteId: number) {
    this.validarId(estudianteId);
    const periodos =
      await this.matriculaRepository.findPeriodosByEstudiante(estudianteId);
    if (periodos.length === 0) {
      throw new NotFoundException(
        'No se encontraron períodos académicos matriculados',
      );
    }
    return periodos;
  }

  async delete(id: number): Promise<Matricula> {
    const matricula = await this.getById(id);
    await this.matriculaRepository.delete(id);
    return matricula;
  }

  private validarId(id: number): void {
    if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
      throw new BadRequestException(
        'El ID debe ser un entero entre 1 y 2147483647',
      );
    }
  }

  private async validarReferencias(
    estudianteId: number,
    periodoAcademicoId: number,
  ) {
    if (!(await this.matriculaRepository.existeEstudiante(estudianteId))) {
      throw new NotFoundException('Estudiante no encontrado');
    }
    if (!(await this.matriculaRepository.existePeriodo(periodoAcademicoId))) {
      throw new NotFoundException('Período académico no encontrado');
    }
  }

  private async validarDuplicado(
    estudianteId: number,
    periodoAcademicoId: number,
    idActual?: number,
  ) {
    const existente = await this.matriculaRepository.findByEstudianteYPeriodo(
      estudianteId,
      periodoAcademicoId,
    );
    if (existente && existente.id !== idActual) {
      throw new ConflictException(
        'El estudiante ya tiene una matrícula en este período académico',
      );
    }
  }
}
