import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionOrmEntity } from '@infrastructure/database/entitites/asignacion.orm-entity';
import { AsignacionController } from './asignacion.controller';
import { AsignacionService } from '@application/services/asignacion.service';
import { AsignacionRepository } from '@infrastructure/repositories/asignacion.repository';
import { I_ASIGNACION_REPOSITORY } from '@domain/interfaces/asignacion.repository.interface';
import { DocenteModule } from 'src/docente/docente.module';

@Module({
  imports: [TypeOrmModule.forFeature([AsignacionOrmEntity]), DocenteModule],
  controllers: [AsignacionController],
  providers: [
    AsignacionService,
    {
      provide: I_ASIGNACION_REPOSITORY,
      useClass: AsignacionRepository,
    },
  ],
})
export class AsignacionModule {}
