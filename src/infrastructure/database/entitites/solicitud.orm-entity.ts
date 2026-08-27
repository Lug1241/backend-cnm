import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DocenteOrmEntity } from '@infrastructure/database/entitites/docente.orm-entity';
import {
  EstadoSolicitud,
  DescripcionSolicitud,
} from '../../../domain/entities/solicitud.entity';

@Entity('SolicitudesPermisos')
export class SolicitudOrmEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id!: number;

  @Column({ name: 'ID_docente', type: 'integer' })
  ID_docente!: number;

  @ManyToOne(() => DocenteOrmEntity)
  @JoinColumn({ name: 'ID_docente' })
  docente!: DocenteOrmEntity;

  @Column({
    type: 'enum',
    enum: DescripcionSolicitud,
  })
  descripcion!: DescripcionSolicitud;

  @Column({ name: 'fecha_inicio', type: 'date', nullable: true })
  fechaInicio!: Date | null;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin!: Date | null;

  @Column({ type: 'varchar', length: 50 })
  motivo!: string;

  @Column({
    type: 'enum',
    enum: EstadoSolicitud,
    default: EstadoSolicitud.PENDIENTE,
  })
  estado!: EstadoSolicitud;

  @Column({ type: 'date' })
  fechaSolicitud!: Date;
}
