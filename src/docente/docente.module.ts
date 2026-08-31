import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocenteOrmEntity } from '@infrastructure/database/entitites/docente.orm-entity';
import { DocenteController } from './docente.controller';
import { DocenteService } from '@application/services/docente.service';
import { DocenteRepository } from '@infrastructure/database/repositories/docente.repository';
import { I_DOCENTE_REPOSITORY } from '@domain/interfaces/docente.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([DocenteOrmEntity])],
  controllers: [DocenteController],
  providers: [
    DocenteService,
    {
      provide: I_DOCENTE_REPOSITORY,
      useClass: DocenteRepository,
    },
  ],
  exports: [I_DOCENTE_REPOSITORY],
})
export class DocenteModule {}
