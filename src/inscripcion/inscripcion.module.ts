import { InscripcionOrmEntity } from '@infrastructure/database/entitites/inscripcion.orm-entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InscripcionController } from './inscripcion.controller';
import { InscripcionService } from '@application/services/inscripcion.service';
import { I_INSCRIPCION_REPOSITORY } from '@domain/interfaces/inscripcion.repository.interface';
import { InscripcionRepository } from '@infrastructure/repositories/inscripcion.repository';
import { AsignacionModule } from 'src/asignacion/asignacion.module';
import { EstudianteModule } from 'src/estudiante/estudiante.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InscripcionOrmEntity]),
    AsignacionModule,
    EstudianteModule,
    AuthModule,
  ],
  controllers: [InscripcionController],
  providers: [
    InscripcionService,
    {
      provide: I_INSCRIPCION_REPOSITORY,
      useClass: InscripcionRepository,
    },
  ],
  exports: [I_INSCRIPCION_REPOSITORY],
})
export class InscripcionModule {}
