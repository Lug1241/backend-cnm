import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuimestreCalificacion } from '../../../domain/entities/calificacion.entity';
import { InscripcionOrmEntity } from './inscripcion.orm-entity';

@Entity('calificaciones_quimestrales_be')
export class CalificacionQuimestralBeOrmEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id!: number;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  examen!: string;

  @Column({
    type: 'enum',
    enum: QuimestreCalificacion,
    nullable: true,
  })
  quimestre!: QuimestreCalificacion | null;

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
