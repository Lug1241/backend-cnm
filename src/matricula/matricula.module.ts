import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatriculaService } from '@application/services/matricula.service';
import { I_MATRICULA_REPOSITORY } from '@domain/interfaces/matricula.repository.interface';
import { MatriculaOrmEntity } from '@infrastructure/database/entitites/matricula.orm-entity';
import { MatriculaRepository } from '@infrastructure/database/repositories/matricula.repository';
import { MatriculaController } from './matricula.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MatriculaOrmEntity])],
  controllers: [MatriculaController],
  providers: [
    MatriculaService,
    { provide: I_MATRICULA_REPOSITORY, useClass: MatriculaRepository },
  ],
  exports: [I_MATRICULA_REPOSITORY],
})
export class MatriculaModule {}
