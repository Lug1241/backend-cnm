import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TipoProceso } from '../../../domain/entities/fecha-proceso.entity';

@Entity('fechas_procesos')
export class FechaProcesoOrmEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id!: number;

  @Column({ type: 'date', name: 'fecha_proceso' })
  fechaProceso!: Date;

  @Column({ type: 'enum', enum: TipoProceso })
  proceso!: TipoProceso;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion!: string;

  @CreateDateColumn({ type: 'datetime', name: 'createdAt' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updatedAt' })
  updatedAt!: Date;
}
