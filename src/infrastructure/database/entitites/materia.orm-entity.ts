import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  NivelMateria,
  TipoMateria,
} from '../../../domain/entities/materia.entity';
import { empty } from 'rxjs';

@Entity('materias')
export class MateriaOrmEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id!: number;

  @Column({ type: 'varchar', length: 50 })
  nombre!: string;

  @Column({
    type: 'enum',
    enum: NivelMateria,
  })
  nivel!: NivelMateria;

  @Column({
    type: 'enum',
    enum: TipoMateria,
    default: TipoMateria.INDIVIDUAL,
  })
  tipo!: TipoMateria;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  observaciones!: string;

  @Column({
    type: 'integer',
  })
  edadMin!: number;

  @Column({ type: 'datetime', name: 'createdAt' })
  fechaCreacion!: Date;

  @Column({ type: 'datetime', name: 'updatedAt' })
  fechaModificacion!: Date;
}
