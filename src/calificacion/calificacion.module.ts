import { CalificacionOrmEntity } from '@infrastructure/database/entitites/calificacion.orm-entity';
import { CalificacionDocenteService } from '@application/services/calificacion-docente.service';
import { AsignacionModule } from '../asignacion/asignacion.module';
import { FechaProcesoModule } from '../fecha-proceso/fecha-proceso.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalificacionController } from './calificacion.controller';
import { CalificacionService } from '@application/services/calificacion.service';
import { I_CALIFICACION_REPOSITORY } from '@domain/interfaces/calificacion.repository.interface';
import { CalificacionRepository } from '@infrastructure/repositories/calificacion.repository';
import { AuthModule } from '../auth/auth.module';
import { InscripcionModule } from '../inscripcion/inscripcion.module';
import { EstudianteModule } from '../estudiante/estudiante.module';
import { MatriculaModule } from '../matricula/matricula.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalificacionOrmEntity]),
    AuthModule,
    AsignacionModule,
    FechaProcesoModule,
    InscripcionModule,
    EstudianteModule,
    MatriculaModule,
  ],
  controllers: [CalificacionController],
  providers: [
    CalificacionService,
    CalificacionDocenteService,
    {
      provide: I_CALIFICACION_REPOSITORY,
      useClass: CalificacionRepository,
    },
  ],
  exports: [CalificacionService, I_CALIFICACION_REPOSITORY],
})
export class CalificacionModule {}
