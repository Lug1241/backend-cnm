import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  GeneroEstudiante,
  GrupoEtnicoEstudiante,
  JornadaEstudiante,
  NivelEstudiante,
} from '../../../domain/entities/estudiante.entity';
import { RepresentanteOrmEntity } from './representante.orm-entity';

@Entity('estudiantes')
export class EstudianteOrmEntity {
  @PrimaryGeneratedColumn({
    name: 'ID',
  })
  id!: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  nroCedula!: string;

  @Column({
    name: 'primer_nombre',
    type: 'varchar',
    length: 255,
  })
  primerNombre!: string;

  @Column({
    name: 'segundo_nombre',
    type: 'varchar',
    length: 255,
  })
  segundoNombre!: string;

  @Column({
    name: 'primer_apellido',
    type: 'varchar',
    length: 255,
  })
  primerApellido!: string;

  @Column({
    name: 'segundo_apellido',
    type: 'varchar',
    length: 255,
  })
  segundoApellido!: string;

  @Column({
    name: 'cedula_PDF',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  cedulaPdf!: string | null;

  @Column({
    type: 'enum',
    enum: GeneroEstudiante,
  })
  genero!: GeneroEstudiante;

  @Column({
    type: 'int',
  })
  anioMatricula!: number;

  @Column({
    type: 'enum',
    enum: JornadaEstudiante,
  })
  jornada!: JornadaEstudiante;

  @Column({
    name: 'fecha_nacimiento',
    type: 'date',
  })
  fechaNacimiento!: string;

  @Column({
    name: 'grupo_etnico',
    type: 'enum',
    enum: GrupoEtnicoEstudiante,
  })
  grupoEtnico!: GrupoEtnicoEstudiante;

  @Column({
    type: 'varchar',
    length: 255,
  })
  especialidad!: string;

  @Column({
    type: 'int',
    default: 1,
  })
  nroMatricula!: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  nacionalidad!: string;

  @Column({
    name: 'IER',
    type: 'varchar',
    length: 255,
  })
  ier!: string;

  @Column({
    name: 'matricula_IER_PDF',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  matriculaIerPdf!: string | null;

  @Column({
    type: 'varchar',
    length: 255,
  })
  direccion!: string;

  @Column({
    type: 'enum',
    enum: NivelEstudiante,
  })
  nivel!: NivelEstudiante;

  @Column({
    name: 'ID_representante',
    type: 'int',
  })
  representanteId!: number;

  @ManyToOne(() => RepresentanteOrmEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'ID_representante',
    referencedColumnName: 'id',
  })
  representante!: RepresentanteOrmEntity;

  @Column({
    name: 'createdAt',
    type: 'datetime',
  })
  createdAt!: Date;

  @Column({
    name: 'updatedAt',
    type: 'datetime',
  })
  updatedAt!: Date;
}
