import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type IEstudianteRepository } from '@domain/interfaces/estudiante.repository.interface';
import {
  Estudiante,
  type NivelEstudiante,
} from '@domain/entities/estudiante.entity';
import { EstudianteOrmEntity } from '../entitites/estudiante.orm-entity';
import { Representante } from '@domain/entities/representante.entity';
@Injectable()
export class EstudianteRepository implements IEstudianteRepository {
  constructor(
    @InjectRepository(EstudianteOrmEntity)
    private readonly ormRepository: Repository<EstudianteOrmEntity>,
  ) {}

  private consultaEstudiantes() {
    // El ID de la API se obtiene del representante; la FK existente es su cédula.
    return this.ormRepository
      .createQueryBuilder('estudiante')
      .leftJoin('estudiante.representante', 'representante')
      .addSelect('representante.id');
  }

  private toDomain(
    ormEntity: EstudianteOrmEntity | null,
    incluirRepresentante = false,
  ): Estudiante | null {
    if (!ormEntity) return null;

    return new Estudiante({
      id: ormEntity.id,
      nroCedula: ormEntity.nroCedula,
      primerNombre: ormEntity.primerNombre,
      segundoNombre: ormEntity.segundoNombre,
      primerApellido: ormEntity.primerApellido,
      segundoApellido: ormEntity.segundoApellido,
      cedulaPdf: ormEntity.cedulaPdf,
      genero: ormEntity.genero,
      anioMatricula: ormEntity.anioMatricula,
      jornada: ormEntity.jornada,
      fechaNacimiento: ormEntity.fechaNacimiento,
      grupoEtnico: ormEntity.grupoEtnico,
      especialidad: ormEntity.especialidad,
      nroMatricula: ormEntity.nroMatricula,
      nacionalidad: ormEntity.nacionalidad,
      ier: ormEntity.ier,
      matriculaIerPdf: ormEntity.matriculaIerPdf,
      direccion: ormEntity.direccion,
      nivel: ormEntity.nivel,
      representanteId: ormEntity.representante?.id,
      representanteCedula: ormEntity.representanteCedula,
      representante:
        incluirRepresentante && ormEntity.representante
          ? new Representante({
              id: ormEntity.representante.id,
              nroCedula: ormEntity.representante.nroCedula,
              primerNombre: ormEntity.representante.primerNombre,
              segundoNombre: ormEntity.representante.segundoNombre,
              primerApellido: ormEntity.representante.primerApellido,
              segundoApellido: ormEntity.representante.segundoApellido,
              cedulaPdf: ormEntity.representante.cedulaPdf,
              croquisPdf: ormEntity.representante.croquisPdf,
            })
          : undefined,
      matriculas: ormEntity.matriculas?.map(
        ({ id, nivel, periodoAcademicoId }) => ({
          id,
          nivel,
          periodoAcademicoId,
        }),
      ),
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  async create(estudiante: Estudiante): Promise<Estudiante> {
    const ahora = new Date();
    const {
      representante: _representante,
      representanteId,
      matriculas: _matriculas,
      ...datosEstudiante
    } = estudiante;

    const nuevaEntidad = this.ormRepository.create({
      ...datosEstudiante,
      createdAt: ahora,
      updatedAt: ahora,
    });

    const guardado = await this.ormRepository.save(nuevaEntidad);

    const resultado = this.toDomain(guardado)!;
    resultado.representanteId = representanteId;
    return resultado;
  }

  async update(
    nroCedula: string,
    estudiante: Partial<Estudiante>,
  ): Promise<boolean> {
    const {
      representante: _representante,
      representanteId: _representanteId,
      matriculas: _matriculas,
      ...datosEstudiante
    } = estudiante;

    const resultado = await this.ormRepository.update(
      { nroCedula },
      {
        ...datosEstudiante,
        updatedAt: new Date(),
      },
    );

    return (resultado.affected ?? 0) > 0;
  }

  async findByCedula(nroCedula: string): Promise<Estudiante | null> {
    const ormEntity = await this.consultaEstudiantes()
      .where('estudiante.nroCedula = :nroCedula', { nroCedula })
      .getOne();

    return this.toDomain(ormEntity);
  }

  async findAll(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ data: Estudiante[]; totalRows: number }> {
    const query = this.consultaEstudiantes();

    const terms = search.trim().toLowerCase().split(/\s+/).filter(Boolean);

    terms.forEach((term, index) => {
      const parameter = `term${index}`;

      query.andWhere(
        `(
        LOWER(estudiante.nroCedula) LIKE :${parameter}
        OR LOWER(
          CONCAT_WS(
            ' ',
            estudiante.primer_nombre,
            estudiante.segundo_nombre,
            estudiante.primer_apellido,
            estudiante.segundo_apellido
          )
        ) LIKE :${parameter}
      )`,
        {
          [parameter]: `%${term}%`,
        },
      );
    });

    query
      .orderBy('estudiante.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [ormEntities, totalRows] = await query.getManyAndCount();

    return {
      data: ormEntities.map((entity) => this.toDomain(entity)!),
      totalRows,
    };
  }

  async findByRepresentanteCedula(nroCedula: string): Promise<Estudiante[]> {
    const ormEntities = await this.consultaEstudiantes()
      .where('estudiante.representanteCedula = :nroCedula', { nroCedula })
      .orderBy('estudiante.primerApellido', 'ASC')
      .addOrderBy('estudiante.primerNombre', 'ASC')
      .addOrderBy('estudiante.id', 'ASC')
      .getMany();

    return ormEntities.map((entity) => this.toDomain(entity)!);
  }

  async findByApellido(
    apellido: string,
    page: number,
    limit: number,
  ): Promise<{ data: Estudiante[]; totalRows: number }> {
    const [ormEntities, totalRows] = await this.consultaEstudiantes()
      .where('LOWER(estudiante.primerApellido) LIKE :apellido', {
        apellido: `%${apellido.trim().toLowerCase()}%`,
      })
      .orderBy('estudiante.primerApellido', 'ASC')
      .addOrderBy('estudiante.primerNombre', 'ASC')
      .addOrderBy('estudiante.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: ormEntities.map((entity) => this.toDomain(entity)!),
      totalRows,
    };
  }

  async findByNivel(
    nivel: NivelEstudiante,
    page?: number,
    limit?: number,
  ): Promise<{ data: Estudiante[]; totalRows: number }> {
    const query = this.consultaEstudiantes()
      .where('estudiante.nivel = :nivel', { nivel })
      .orderBy('estudiante.primerApellido', 'ASC')
      .addOrderBy('estudiante.primerNombre', 'ASC')
      .addOrderBy('estudiante.id', 'ASC');

    const paginado = page !== undefined && limit !== undefined;

    if (paginado) {
      query.skip((page - 1) * limit).take(limit);
    } else {
      query.addSelect(['representante.cedulaPdf', 'representante.croquisPdf']);
    }

    const [ormEntities, totalRows] = await query.getManyAndCount();

    return {
      data: ormEntities.map((entity) => this.toDomain(entity, !paginado)!),
      totalRows,
    };
  }

  async findByMatricula(
    nivel: NivelEstudiante,
    idPeriodo: number,
    page?: number,
    limit?: number,
  ): Promise<{ data: Estudiante[]; totalRows: number }> {
    const query = this.consultaEstudiantes()
      .innerJoin('estudiante.matriculas', 'matricula')
      .where('matricula.nivel = :nivel', { nivel })
      .andWhere('matricula.periodoAcademicoId = :idPeriodo', { idPeriodo })
      .addSelect([
        'matricula.id',
        'matricula.nivel',
        'matricula.periodoAcademicoId',
      ])
      .orderBy('estudiante.primerApellido', 'ASC')
      .addOrderBy('estudiante.primerNombre', 'ASC')
      .addOrderBy('estudiante.id', 'ASC');

    const paginado = page !== undefined && limit !== undefined;

    if (paginado) {
      query.skip((page - 1) * limit).take(limit);
    } else {
      query.addSelect(['representante.cedulaPdf', 'representante.croquisPdf']);
    }

    const [entities, totalRows] = await query.getManyAndCount();

    return {
      data: entities.map((entity) => this.toDomain(entity, !paginado)!),
      totalRows,
    };
  }

  async delete(nroCedula: string): Promise<void> {
    await this.ormRepository.delete({ nroCedula });
  }
}
