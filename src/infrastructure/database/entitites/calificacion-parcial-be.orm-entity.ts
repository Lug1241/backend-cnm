import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  ParcialCalificacion,
  QuimestreCalificacion,
} from '../../../domain/entities/calificacion.entity';
import { InscripcionOrmEntity } from './inscripcion.orm-entity';

@Entity('calificaciones_parciales_be')
export class CalificacionParcialBeOrmEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id!: number;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  insumo1!: string;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  insumo2!: string;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  evaluacion!: string;

  @Column({
    type: 'decimal',
    precision: 4,
    scale: 2,
    nullable: true,
  })
  mejoramiento!: string | null;

  @Column({
    type: 'enum',
    enum: QuimestreCalificacion,
    nullable: true,
  })
  quimestre!: QuimestreCalificacion | null;

  @Column({
    type: 'enum',
    enum: ParcialCalificacion,
    nullable: true,
  })
  parcial!: ParcialCalificacion | null;

  @Column({ name: 'ID_inscripcion', type: 'int' })
  inscripcionId!: number;

  @ManyToOne(() => InscripcionOrmEntity, {
    nullable: false,
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'ID_inscripcion', referencedColumnName: 'id' })
  inscripcion!: InscripcionOrmEntity;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamp', nullable: true })
  createdAt!: Date | null;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp', nullable: true })
  updatedAt!: Date | null;
}
