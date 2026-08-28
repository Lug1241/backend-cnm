import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('representantes')
export class RepresentanteOrmEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  nroCedula!: string;

  @Column({ name: 'primer_nombre', type: 'varchar', length: 255 })
  primerNombre!: string;

  @Column({ name: 'segundo_nombre', type: 'varchar', length: 255 })
  segundoNombre!: string;

  @Column({ name: 'primer_apellido', type: 'varchar', length: 255 })
  primerApellido!: string;

  @Column({ name: 'segundo_apellido', type: 'varchar', length: 255 })
  segundoApellido!: string;

  @Column({ type: 'varchar', length: 255 })
  celular!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({
    name: 'cedula_PDF',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  cedulaPdf!: string | null;

  @Column({
    name: 'croquis_PDF',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  croquisPdf!: string | null;

  @Column({ type: 'varchar', length: 255, default: '' })
  convencional!: string;

  @Column({ type: 'varchar', length: 255 })
  emergencia!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resetToken!: string | null;

  @Column({ type: 'datetime', nullable: true })
  resetTokenExpires!: Date | null;

  @CreateDateColumn({ name: 'createdAt', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'datetime' })
  updatedAt!: Date;

  @Column({
    name: 'debe_cambiar_password',
    type: 'boolean',
    default: true,
  })
  debeCambiarPassword!: boolean;
}
