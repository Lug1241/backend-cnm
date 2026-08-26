import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type IDocenteRepository } from '@domain/interfaces/docente.repository.interface';
import { Docente } from '@domain/entities/docente.entity';
import { DocenteOrmEntity } from '../entitites/docente.orm-entity';

@Injectable()
export class DocenteRepository implements IDocenteRepository {
  constructor(
    @InjectRepository(DocenteOrmEntity)
    private readonly ormRepository: Repository<DocenteOrmEntity>,
  ) {}

  private toDomain(ormEntity: DocenteOrmEntity | null): Docente | null {
    if (!ormEntity) return null;
    return new Docente({
      id: ormEntity.id,
      nroCedula: ormEntity.nroCedula,
      primerNombre: ormEntity.primerNombre,
      segundoNombre: ormEntity.segundoNombre,
      primerApellido: ormEntity.primerApellido,
      segundoApellido: ormEntity.segundoApellido,
      celular: ormEntity.celular,
      email: ormEntity.email,
      rol: ormEntity.rol,
      password: ormEntity.password,
      debeCambiarPassword: ormEntity.debeCambiarPassword,
      habilitado: ormEntity.habilitado,
      habilitadoHasta: ormEntity.habilitadoHasta,
      resetToken: ormEntity.resetToken,
      resetTokenExpires: ormEntity.resetTokenExpires,
    });
  }

  async create(docente: Docente): Promise<Docente> {
    const nuevo = this.ormRepository.create({
      ...docente,
    });
    const guardado = await this.ormRepository.save(nuevo);
    return this.toDomain(guardado)!;
  }

  async update(nroCedula: string, docente: Partial<Docente>): Promise<boolean> {
    const resultado = await this.ormRepository.update({ nroCedula }, docente);
    return (resultado.affected ?? 0) > 0;
  }

  async updatePassword(nroCedula: string, hashedPw: string): Promise<boolean> {
    const resultado = await this.ormRepository.update(
      { nroCedula },
      { password: hashedPw },
    );
    return (resultado.affected ?? 0) > 0;
  }

  async findByCedula(nroCedula: string): Promise<Docente | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: { nroCedula },
    });
    return this.toDomain(ormEntity);
  }

  async findByEmail(email: string): Promise<Docente | null> {
    const ormEntity = await this.ormRepository.findOne({ where: { email } });
    return this.toDomain(ormEntity);
  }

  async findAll(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ data: Docente[]; totalRows: number }> {
    const query = this.ormRepository.createQueryBuilder('docente');

    if (search.trim() !== '') {
      const terms = search.trim().toLowerCase().split(/\s+/);

      if (terms.length === 2) {
        const [term1, term2] = terms;
        query.where(
          `((LOWER(docente.primer_nombre) LIKE :term1 AND LOWER(docente.primer_apellido) LIKE :term2) OR 
            (LOWER(docente.primer_nombre) LIKE :term2 AND LOWER(docente.primer_apellido) LIKE :term1))`,
          { term1: `%${term1}%`, term2: `%${term2}%` },
        );
      } else {
        query.where(
          `(LOWER(docente.primer_nombre) LIKE :term OR LOWER(docente.primer_apellido) LIKE :term)`,
          { term: `%${terms[0]}%` },
        );
      }
    }

    query.skip((page - 1) * limit).take(limit);

    const [ormEntities, totalRows] = await query.getManyAndCount();

    return {
      data: ormEntities.map((ent) => this.toDomain(ent)!),
      totalRows,
    };
  }

  async delete(nroCedula: string): Promise<void> {
    await this.ormRepository.delete(nroCedula);
  }
}
