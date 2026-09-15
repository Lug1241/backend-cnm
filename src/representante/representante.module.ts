import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepresentanteOrmEntity } from '@infrastructure/database/entitites/representante.orm-entity';
import { RepresentanteController } from './representante.controller';
import { RepresentanteService } from '@application/services/representante.service';
import { RepresentanteRepository } from '@infrastructure/repositories/representante.repository';
import { I_REPRESENTANTE_REPOSITORY } from '@domain/interfaces/representante.repository.interface';
import { ArchivoModule } from '../archivo/archivo.module';
import { PeriodoAcademicoModule } from '../periodo-academico/periodo-academico.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RepresentanteOrmEntity]),
    ArchivoModule,
    PeriodoAcademicoModule,
  ],
  controllers: [RepresentanteController],
  providers: [
    RepresentanteService,
    {
      provide: I_REPRESENTANTE_REPOSITORY,
      useClass: RepresentanteRepository,
    },
  ],
  exports: [I_REPRESENTANTE_REPOSITORY],
})
export class RepresentanteModule {}
