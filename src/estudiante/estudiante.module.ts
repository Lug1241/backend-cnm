import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstudianteOrmEntity } from '@infrastructure/database/entitites/estudiante.orm-entity';
import { EstudianteRepository } from '@infrastructure/database/repositories/estudiante.repository';
import { I_ESTUDIANTE_REPOSITORY } from '@domain/interfaces/estudiante.repository.interface';
import { EstudianteService } from '@application/services/estudiante.service';
import { EstudianteController } from './estudiante.controller';
import { RepresentanteModule } from '../representante/representante.module';
import { PeriodoAcademicoModule } from '../periodo-academico/periodo-academico.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EstudianteOrmEntity]),
    RepresentanteModule,
    PeriodoAcademicoModule,
  ],
  controllers: [EstudianteController],
  providers: [
    EstudianteService,
    {
      provide: I_ESTUDIANTE_REPOSITORY,
      useClass: EstudianteRepository,
    },
  ],
  exports: [I_ESTUDIANTE_REPOSITORY],
})
export class EstudianteModule {}
