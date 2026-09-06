import { InscripcionOrmEntity } from "@infrastructure/database/entitites/inscripcion.orm-entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InscripcionController } from "./inscripcion.controller";
import { InscripcionService } from "@application/services/inscripcion.service";
import { I_INSCRIPCION_REPOSITORY } from "@domain/interfaces/inscripcion.repository.interface";
import { InscripcionRepository } from "@infrastructure/repositories/inscripcion.repository";
import { AsignacionModule } from "src/asignacion/asignacion.module";

@Module({
    imports: [TypeOrmModule.forFeature([InscripcionOrmEntity]),
        AsignacionModule,
    ],
    controllers: [InscripcionController],
    providers: [
        InscripcionService,
        {
            provide: I_INSCRIPCION_REPOSITORY,
            useClass: InscripcionRepository,
        }
    ],
})
export class InscripcionModule {}