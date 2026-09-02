import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  EstadoMatricula,
  NivelMatricula,
} from '../../../domain/entities/matricula.entity';
import { EstudianteOrmEntity } from './estudiante.orm-entity';
import { PeriodoAcademicoOrmEntity } from './periodo-academico.orm-entity';

@Entity('matriculas')
@Index(
  'Matriculas_ID_periodo_academico_ID_estudiante_unique',
  ['estudianteId', 'periodoAcademicoId'],
  { unique: true },
)
export class MatriculaOrmEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id!: number;

  @Column({ type: 'enum', enum: NivelMatricula })
  nivel!: NivelMatricula;

  @Column({ type: 'enum', enum: EstadoMatricula })
  estado!: EstadoMatricula;

  @Column({ name: 'ID_estudiante', type: 'int' })
  estudianteId!: number;

  @Column({ name: 'ID_periodo_academico', type: 'int' })
  periodoAcademicoId!: number;

  @ManyToOne(() => EstudianteOrmEntity, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'ID_estudiante', referencedColumnName: 'id' })
  estudiante!: EstudianteOrmEntity;

  @ManyToOne(() => PeriodoAcademicoOrmEntity, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'ID_periodo_academico', referencedColumnName: 'id' })
  periodoAcademico!: PeriodoAcademicoOrmEntity;

  @Column({ name: 'createdAt', type: 'datetime' })
  createdAt!: Date;

  @Column({ name: 'updatedAt', type: 'datetime' })
  updatedAt!: Date;
}
