import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { EstadoPeriodo } from '../../../domain/entities/periodo-academico.entity';

@Entity('periodos_academicos')
export class PeriodoAcademicoOrmEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  descripcion!: string;

  @Column({
    type: 'enum',
    enum: EstadoPeriodo,
    default: EstadoPeriodo.ACTIVO,
  })
  estado!: EstadoPeriodo;

  @Column({ type: 'date', name: 'fecha_inicio' })
  fechaInicio!: Date;

  @Column({ type: 'date', name: 'fecha_fin' })
  fechaFin!: Date;
}
