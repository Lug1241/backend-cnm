import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InscripcionOrmEntity } from './inscripcion.orm-entity';

@Entity('calificaciones_finales')
export class CalificacionFinalOrmEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id!: number;

  @Column({
    name: 'examen_recuperacion',
    type: 'decimal',
    precision: 4,
    scale: 2,
    nullable: true,
    default: 0,
  })
  examenRecuperacion!: string | null;

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
