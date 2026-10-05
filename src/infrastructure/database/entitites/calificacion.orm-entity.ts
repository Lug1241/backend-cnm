import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  EtapaCalificacion,
  TipoPlantilla,
} from '@domain/entities/calificacion.entity';
import { InscripcionOrmEntity } from './inscripcion.orm-entity';
@Entity('calificaciones')
@Index('uq_calificaciones_inscripcion_etapa', ['inscripcionId', 'etapa'], {
  unique: true,
})
export class CalificacionOrmEntity {
  @PrimaryGeneratedColumn({ name: 'ID' }) id!: number;
  @Column({ name: 'ID_inscripcion', type: 'int' }) inscripcionId!: number;
  @ManyToOne(() => InscripcionOrmEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'ID_inscripcion' })
  inscripcion!: InscripcionOrmEntity;
  @Column({ type: 'enum', enum: EtapaCalificacion }) etapa!: EtapaCalificacion;
  @Column({ name: 'tipo_plantilla', type: 'enum', enum: TipoPlantilla })
  tipoPlantilla!: TipoPlantilla;
  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  insumo1!: number | null;
  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  insumo2!: number | null;
  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  evaluacion!: number | null;
  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  mejoramiento!: number | null;
  @Column({ type: 'json', nullable: true }) comportamiento!: number[] | null;
  @Column({
    name: 'nota_examen',
    type: 'decimal',
    precision: 4,
    scale: 2,
    nullable: true,
  })
  notaExamen!: number | null;
  @CreateDateColumn({ type: 'datetime' }) createdAt!: Date;
  @UpdateDateColumn({ type: 'datetime' }) updatedAt!: Date;
}
