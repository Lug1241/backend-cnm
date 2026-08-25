import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('docentes') // El nombre exacto de tu tabla
export class DocenteOrmEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id!: number;

  @Column({ type: 'varchar', length: 20 })
  nroCedula!: string;

  @Column({ name: 'primer_nombre', type: 'varchar', length: 50 })
  primerNombre!: string;

  @Column({ name: 'segundo_nombre', type: 'varchar', length: 50 })
  segundoNombre!: string;

  @Column({ name: 'primer_apellido', type: 'varchar', length: 50 })
  primerApellido!: string;

  @Column({ name: 'segundo_apellido', type: 'varchar', length: 50 })
  segundoApellido!: string;

  @Column({ type: 'varchar', length: 15, unique: true })
  celular!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 50 })
  rol!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ name: 'debe_cambiar_password', type: 'boolean', default: true })
  debeCambiarPassword!: boolean;

  @Column({ type: 'boolean', default: false })
  habilitado!: boolean;

  @Column({ name: 'habilitado_hasta', type: 'datetime', nullable: true })
  habilitadoHasta!: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resetToken!: string | null;

  @Column({ name: 'resetTokenExpires', type: 'datetime', nullable: true })
  resetTokenExpires!: Date | null;
}
