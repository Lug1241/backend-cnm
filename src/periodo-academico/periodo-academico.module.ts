import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeriodoAcademicoOrmEntity } from '@infrastructure/database/entitites/periodo-academico.orm-entity';
import { PeriodoAcademicoController } from './periodo-academico.controller';
import { PeriodoAcademicoService } from '@application/services/periodo-academico.service';
import { PeriodoAcademicoRepository } from '@infrastructure/database/repositories/periodo-academico.repository';
import { I_PERIODO_REPOSITORY } from '../domain/interfaces/periodo-academico.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([PeriodoAcademicoOrmEntity])],
  controllers: [PeriodoAcademicoController],
  providers: [
    PeriodoAcademicoService,
    {
      provide: I_PERIODO_REPOSITORY,
      useClass: PeriodoAcademicoRepository,
    },
  ],
})
export class PeriodoAcademicoModule {}
