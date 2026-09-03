import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepresentanteOrmEntity } from '@infrastructure/database/entitites/representante.orm-entity';
import { RepresentanteController } from './representante.controller';
import { RepresentanteService } from '@application/services/representante.service';
import { RepresentanteRepository } from '@infrastructure/repositories/representante.repository';
import { I_REPRESENTANTE_REPOSITORY } from '@domain/interfaces/representante.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([RepresentanteOrmEntity])],
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
