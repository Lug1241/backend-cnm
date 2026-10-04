import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IInscripcionRepository } from '@domain/interfaces/inscripcion.repository.interface';
import { Inscripcion } from '@domain/entities/inscripcion.entity';
import { InscripcionOrmEntity } from '@infrastructure/database/entitites/inscripcion.orm-entity';
import { PeriodoAcademico } from '@domain/entities/periodo-academico.entity';
import { NivelMateria } from '@domain/entities/materia.entity';
import { Asignacion } from '@domain/entities/asignacion.entity';
import { Matricula } from '@domain/entities/matricula.entity';
import { Estudiante } from '@domain/entities/estudiante.entity';
import { MatriculaOrmEntity } from '@infrastructure/database/entitites/matricula.orm-entity';

@Injectable()
export class InscripcionRepository implements IInscripcionRepository {
  constructor(
    @InjectRepository(InscripcionOrmEntity)
    private readonly ormRepository: Repository<InscripcionOrmEntity>,
  ) {}

  private toMatriculaDomain(
    ormEntity?: MatriculaOrmEntity | null,
  ): Matricula | undefined {
    if (!ormEntity) return undefined;

    return new Matricula({
      id: ormEntity.id,
      nivel: ormEntity.nivel,
      estado: ormEntity.estado,
      estudianteId: ormEntity.estudianteId,
      periodoAcademicoId: ormEntity.periodoAcademicoId,
      estudiante: ormEntity.estudiante
        ? new Estudiante({
            id: ormEntity.estudiante.id,
            nroCedula: ormEntity.estudiante.nroCedula,
            primerNombre: ormEntity.estudiante.primerNombre,
            segundoNombre: ormEntity.estudiante.segundoNombre,
            primerApellido: ormEntity.estudiante.primerApellido,
            segundoApellido: ormEntity.estudiante.segundoApellido,
            genero: ormEntity.estudiante.genero,
            anioMatricula: ormEntity.estudiante.anioMatricula,
            jornada: ormEntity.estudiante.jornada,
            fechaNacimiento: ormEntity.estudiante.fechaNacimiento,
            grupoEtnico: ormEntity.estudiante.grupoEtnico,
            especialidad: ormEntity.estudiante.especialidad,
            nroMatricula: ormEntity.estudiante.nroMatricula,
            nacionalidad: ormEntity.estudiante.nacionalidad,
            ier: ormEntity.estudiante.ier,
            direccion: ormEntity.estudiante.direccion,
            nivel: ormEntity.estudiante.nivel,
            representanteId: ormEntity.estudiante.representante?.id,
            representanteCedula: ormEntity.estudiante.representanteCedula,
          })
        : undefined,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  private toDomain(ormEntity: InscripcionOrmEntity): Inscripcion {
    return new Inscripcion({
      id: ormEntity.id,
      asignacion: ormEntity.asignacion
        ? new Asignacion({
            id: ormEntity.asignacion.id,
            paralelo: ormEntity.asignacion.paralelo,
            horaInicio: ormEntity.asignacion.horaInicio,
            horaFin: ormEntity.asignacion.horaFin,
            hora1: ormEntity.asignacion.hora1,
            hora2: ormEntity.asignacion.hora2,
            dias: ormEntity.asignacion.dias,
            cupos: ormEntity.asignacion.cupos,
            docente: ormEntity.asignacion.docente,
            materia: ormEntity.asignacion.materia,
            periodoAcademico: ormEntity.asignacion.periodoAcademico,
          })
        : undefined,
      matricula: this.toMatriculaDomain(ormEntity.matricula),
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  async create(inscripcion: Inscripcion): Promise<Inscripcion> {
    const ormEntity = this.ormRepository.create({
      asignacion: { id: inscripcion.asignacion.id },
      matricula: { id: inscripcion.matricula.id },
    });
    const saved = await this.ormRepository.save(ormEntity);
    return this.toDomain(saved);
  }

  async update(
    id: number,
    inscripcion: Partial<Inscripcion>,
  ): Promise<boolean> {
    const updateData: {
      asignacion?: { id: number };
      matricula?: { id: number };
    } = {};
    if (inscripcion.asignacion?.id !== undefined)
      updateData.asignacion = { id: inscripcion.asignacion.id };
    if (inscripcion.matricula)
      updateData.matricula = { id: inscripcion.matricula.id };

    const result = await this.ormRepository.update(id, updateData);
    return (result.affected ?? 0) > 0;
  }

  async findById(id: number): Promise<Inscripcion | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: { id },
      relations: {
        asignacion: true,
        matricula: true,
      },
    });
    return ormEntity ? this.toDomain(ormEntity) : null;
  }

  async delete(id: number): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async findByAsignacion(idAsignacion: number): Promise<Inscripcion[]> {
    const ormEntities = await this.ormRepository.find({
      where: { asignacion: { id: idAsignacion } },
      relations: {
        matricula: true,
        asignacion: { materia: true, docente: true },
      },
    });

    return ormEntities.map((e) => this.toDomain(e));
  }

  async findByMatricula(idMatricula: number): Promise<Inscripcion[]> {
    const ormEntities = await this.ormRepository.find({
      where: { matricula: { id: idMatricula } },
      relations: {
        matricula: true,
        asignacion: {
          materia: true,
          docente: true,
        },
      },
    });
    return ormEntities.map((e) => this.toDomain(e));
  }

  async findIndividualesByDocente(
    idDocente: string,
    periodo: PeriodoAcademico,
    skip: number,
    limit: number,
  ): Promise<{ data: Inscripcion[]; totalRows: number }> {
    const [ormEntities, totalRows] = await this.ormRepository
      .createQueryBuilder('inscripcion')
      .leftJoinAndSelect('inscripcion.asignacion', 'asignacion')
      .leftJoinAndSelect('asignacion.materia', 'materia')
      .leftJoinAndSelect('asignacion.docente', 'docente')
      .leftJoinAndSelect('inscripcion.matricula', 'matricula')
      .leftJoinAndSelect('matricula.estudiante', 'estudiante')
      .where('docente.nroCedula = :idDocente', { idDocente })
      .andWhere('materia.tipo = :tipo', { tipo: 'individual' })
      .andWhere('matricula.periodoAcademico = :idPeriodo', {
        idPeriodo: periodo.id,
      })
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data: ormEntities.map((e) => this.toDomain(e)), totalRows };
  }

  async findIndividualesByNivel(
    nivel: NivelMateria[],
    periodo: PeriodoAcademico,
    skip: number,
    limit: number,
  ): Promise<{ data: Inscripcion[]; totalRows: number }> {
    const [ormEntities, totalRows] = await this.ormRepository
      .createQueryBuilder('inscripcion')
      .innerJoinAndSelect('inscripcion.asignacion', 'asignacion')
      .innerJoinAndSelect(
        'asignacion.materia',
        'materia',
        'materia.nivel IN (:...nivel) AND materia.tipo = :tipo',
        { nivel, tipo: 'individual' },
      )
      .leftJoinAndSelect('asignacion.docente', 'docente')
      .innerJoinAndSelect(
        'inscripcion.matricula',
        'matricula',
        'matricula.periodoAcademico = :idPeriodo',
        { idPeriodo: periodo.id },
      )
      .leftJoinAndSelect('matricula.estudiante', 'estudiante')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data: ormEntities.map((e) => this.toDomain(e)), totalRows };
  }
}
