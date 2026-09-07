import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MatriculaOrmEntity } from "./matricula.orm-entity";
import { AsignacionOrmEntity } from "./asignacion.orm-entity";

@Entity('inscripciones')
export class InscripcionOrmEntity {
    @PrimaryGeneratedColumn({ name: 'ID'})    
    id!: number;

    @ManyToOne(() => AsignacionOrmEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ID_asignacion'})
    asignacion!: AsignacionOrmEntity;
    
    @ManyToOne(() => MatriculaOrmEntity)
    @JoinColumn({ name: 'ID_matricula'})
    matricula!: MatriculaOrmEntity;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}