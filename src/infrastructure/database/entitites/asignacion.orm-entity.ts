import { DiaSemana } from "@domain/entities/asignacion.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DocenteOrmEntity } from "./docente.orm-entity";
import { MateriaOrmEntity } from "./materia.orm-entity";
import { PeriodoAcademicoOrmEntity } from "./periodo-academico.orm-entity";

@Entity('Asignaciones')
export class AsignacionOrmEntity {
    @PrimaryGeneratedColumn({ name: 'ID' })
    id!: number;

    @Column({ name: 'paralelo', type: 'varchar', nullable: false, default: ""})
    paralelo!: string;

    @Column({ name: 'horaInicio', type: 'time', nullable: false})
    horaInicio!: string;
    
    @Column({ name: 'horaFin', type: 'time', nullable: false})
    horaFin!: string;
    
    @Column({ name: 'hora1', type: 'time', nullable: true})
    hora1!: string;

    @Column({ name: 'hora2', type: 'time', nullable: true})
    hora2!: string;

    @Column({ name: 'dias', type: 'json', nullable: false})
    dias!: DiaSemana[];

    @Column({name: 'cupos', type: 'integer', nullable: false, default: 1})
    cupos!: number;

    @ManyToOne(() => DocenteOrmEntity)
    @JoinColumn({name: 'ID_docente'})
    docente!: DocenteOrmEntity;

    @ManyToOne(() => MateriaOrmEntity)
    @JoinColumn({name: 'ID_materia'})
    materia!: MateriaOrmEntity;

    @ManyToOne(() => PeriodoAcademicoOrmEntity)
    @JoinColumn({name: 'ID_periodo_academico'})
    periodoAcademico!: PeriodoAcademicoOrmEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}