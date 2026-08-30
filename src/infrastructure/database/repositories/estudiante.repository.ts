import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type IEstudianteRepository } from '@domain/interfaces/estudiante.repository.interface';
import { Estudiante } from '@domain/entities/estudiante.entity';
import { EstudianteOrmEntity } from '../entitites/estudiante.orm-entity';

@Injectable()
export class EstudianteRepository implements IEstudianteRepository {
  constructor(
    @InjectRepository(EstudianteOrmEntity)
    private readonly ormRepository: Repository<EstudianteOrmEntity>,
  ) {}

  private toDomain(ormEntity: EstudianteOrmEntity | null): Estudiante | null {
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
      nroCedulaRepresentante: ormEntity.nroCedulaRepresentante,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  async create(estudiante: Estudiante): Promise<Estudiante> {
    const ahora = new Date();

    const nuevaEntidad = this.ormRepository.create({
      ...estudiante,
      createdAt: ahora,
      updatedAt: ahora,
    });

    const guardado = await this.ormRepository.save(nuevaEntidad);

    return this.toDomain(guardado)!;
  }

  async update(
    nroCedula: string,
    estudiante: Partial<Estudiante>,
  ): Promise<boolean> {
    const resultado = await this.ormRepository.update(
      { nroCedula },
      {
        ...estudiante,
        updatedAt: new Date(),
      },
    );

    return (resultado.affected ?? 0) > 0;
  }

  async findByCedula(nroCedula: string): Promise<Estudiante | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: { nroCedula },
    });

    return this.toDomain(ormEntity);
  }

  async findAll(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ data: Estudiante[]; totalRows: number }> {
    const query = this.ormRepository.createQueryBuilder('estudiante');

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

  async delete(nroCedula: string): Promise<void> {
    await this.ormRepository.delete({ nroCedula });
  }
}
