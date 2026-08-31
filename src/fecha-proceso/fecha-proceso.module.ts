import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FechaProcesoOrmEntity } from '@infrastructure/database/entitites/fecha-proceso.orm-entity';
import { FechaProcesoController } from './fecha-proceso.controller';
import { FechaProcesoService } from '@application/services/fecha.service';
import { FechaProcesoRepository } from '@infrastructure/database/repositories/fecha-proceso.repository';
import { I_FECHA_PROCESO_REPOSITORY } from '../domain/interfaces/fecha-proceso.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([FechaProcesoOrmEntity])],
  controllers: [FechaProcesoController],
  providers: [
    FechaProcesoService,
    {
      provide: I_FECHA_PROCESO_REPOSITORY,
      useClass: FechaProcesoRepository,
    },
  ],
})
export class FechaProcesoModule {}
