import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type IRepresentanteRepository } from '@domain/interfaces/representante.repository.interface';
import { Representante } from '@domain/entities/representante.entity';
import { RepresentanteOrmEntity } from '../entitites/representante.orm-entity';

@Injectable()
export class RepresentanteRepository implements IRepresentanteRepository {
  constructor(
    @InjectRepository(RepresentanteOrmEntity)
    private readonly ormRepository: Repository<RepresentanteOrmEntity>,
  ) {}

  private toDomain(
    ormEntity: RepresentanteOrmEntity | null,
  ): Representante | null {
    if (!ormEntity) return null;

    return new Representante({
      id: ormEntity.id,
      nroCedula: ormEntity.nroCedula,
      primerNombre: ormEntity.primerNombre,
      segundoNombre: ormEntity.segundoNombre,
      primerApellido: ormEntity.primerApellido,
      segundoApellido: ormEntity.segundoApellido,
      celular: ormEntity.celular,
      email: ormEntity.email,
      cedulaPdf: ormEntity.cedulaPdf,
      croquisPdf: ormEntity.croquisPdf,
      convencional: ormEntity.convencional,
      emergencia: ormEntity.emergencia,
      password: ormEntity.password,
      debeCambiarPassword: ormEntity.debeCambiarPassword,
      resetToken: ormEntity.resetToken,
      resetTokenExpires: ormEntity.resetTokenExpires,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  async create(representante: Representante): Promise<Representante> {
    const nuevaEntidad = this.ormRepository.create({
      ...representante,
    });

    const guardado = await this.ormRepository.save(nuevaEntidad);

    return this.toDomain(guardado)!;
  }

  async update(
    id: number,
    representante: Partial<Representante>,
  ): Promise<boolean> {
    const resultado = await this.ormRepository.update({ id }, representante);

    return (resultado.affected ?? 0) > 0;
  }

  async updatePassword(id: number, hashedPassword: string): Promise<boolean> {
    const resultado = await this.ormRepository.update(
      { id },
      { password: hashedPassword },
    );

    return (resultado.affected ?? 0) > 0;
  }

  async findByCedula(nroCedula: string): Promise<Representante | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: { nroCedula },
    });

    return this.toDomain(ormEntity);
  }
  async findByID(id: number): Promise<Representante | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: { id },
    });

    return this.toDomain(ormEntity);
  }

  async findByEmail(email: string): Promise<Representante | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: { email },
    });

    return this.toDomain(ormEntity);
  }

  async findAll(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ data: Representante[]; totalRows: number }> {
    const query = this.ormRepository.createQueryBuilder('representante');

    if (search.trim() !== '') {
      const terms = search.trim().toLowerCase().split(/\s+/);

      if (terms.length === 2) {
        const [term1, term2] = terms;

        query.where(
          `(
            (
              LOWER(representante.primer_nombre) LIKE :term1
              AND LOWER(representante.primer_apellido) LIKE :term2
            )
            OR
            (
              LOWER(representante.primer_nombre) LIKE :term2
              AND LOWER(representante.primer_apellido) LIKE :term1
            )
          )`,
          {
            term1: `%${term1}%`,
            term2: `%${term2}%`,
          },
        );
      } else {
        query.where(
          `(
            LOWER(representante.primer_nombre) LIKE :term
            OR LOWER(representante.primer_apellido) LIKE :term
          )`,
          {
            term: `%${terms[0]}%`,
          },
        );
      }
    }

    query.skip((page - 1) * limit).take(limit);

    const [ormEntities, totalRows] = await query.getManyAndCount();

    return {
      data: ormEntities.map((entity) => this.toDomain(entity)!),
      totalRows,
    };
  }

  async delete(id: number): Promise<void> {
    await this.ormRepository.delete({ id });
  }
}
