import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('fechas_notas')
export class FechaNotaOrmEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id!: number;

  @Column({ type: 'date', name: 'fecha_inicio' })
  fechaInicio!: string;

  @Column({ type: 'date', name: 'fecha_fin' })
  fechaFin!: string;

  @Column({ type: 'varchar', length: 255 })
  descripcion!: string;

  @CreateDateColumn({ type: 'datetime', name: 'createdAt' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updatedAt' })
  updatedAt!: Date;
}
