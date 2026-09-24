import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalificacionController } from './calificacion.controller';
import { CalificacionService } from '@application/services/calificacion.service';
import { I_CALIFICACION_REPOSITORY } from '@domain/interfaces/calificacion.repository.interface';
import { CalificacionRepository } from '@infrastructure/repositories/calificacion.repository';
import { CalificacionParcialOrmEntity } from '@infrastructure/database/entitites/calificacion-parcial.orm-entity';
import { CalificacionQuimestralOrmEntity } from '@infrastructure/database/entitites/calificacion-quimestral.orm-entity';
import { CalificacionFinalOrmEntity } from '@infrastructure/database/entitites/calificacion-final.orm-entity';
import { CalificacionParcialBeOrmEntity } from '@infrastructure/database/entitites/calificacion-parcial-be.orm-entity';
import { CalificacionQuimestralBeOrmEntity } from '@infrastructure/database/entitites/calificacion-quimestral-be.orm-entity';
import { AuthModule } from '../auth/auth.module';
import { InscripcionModule } from '../inscripcion/inscripcion.module';
import { EstudianteModule } from '../estudiante/estudiante.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CalificacionParcialOrmEntity,
      CalificacionQuimestralOrmEntity,
      CalificacionFinalOrmEntity,
      CalificacionParcialBeOrmEntity,
      CalificacionQuimestralBeOrmEntity,
    ]),
    AuthModule,
    InscripcionModule,
    EstudianteModule,
  ],
  controllers: [CalificacionController],
  providers: [
    CalificacionService,
    {
      provide: I_CALIFICACION_REPOSITORY,
      useClass: CalificacionRepository,
    },
  ],
  exports: [CalificacionService, I_CALIFICACION_REPOSITORY],
})
export class CalificacionModule {}
