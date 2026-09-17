import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('fechas_procesos')
export class FechaProcesoOrmEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id!: number;

  @Column({ type: 'date', name: 'fecha_inicio' })
  fechaInicio!: Date;

  @Column({ type: 'date', name: 'fecha_fin' })
  fechaFin!: Date;

  @Column({ type: 'varchar', length: 255 })
  proceso!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion?: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'createdAt' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updatedAt' })
  updatedAt!: Date;
}
