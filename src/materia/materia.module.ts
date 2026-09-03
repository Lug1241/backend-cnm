import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MateriaOrmEntity } from '@infrastructure/database/entitites/materia.orm-entity';
import { MateriaController } from './materia.controller';
import { MateriaService } from '@application/services/materia.service';
import { MateriaRepository } from '@infrastructure/repositories/materia.repository';
import { I_MATERIA_REPOSITORY } from '../domain/interfaces/materia.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([MateriaOrmEntity])],
  controllers: [MateriaController],
  providers: [
    MateriaService,
    {
      provide: I_MATERIA_REPOSITORY,
      useClass: MateriaRepository,
    },
  ],
})
export class MateriaModule {}
