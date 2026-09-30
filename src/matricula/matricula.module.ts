import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatriculaService } from '@application/services/matricula.service';
import { I_MATRICULA_REPOSITORY } from '@domain/interfaces/matricula.repository.interface';
import { MatriculaOrmEntity } from '@infrastructure/database/entitites/matricula.orm-entity';
import { MatriculaRepository } from '@infrastructure/repositories/matricula.repository';
import { MatriculaController } from './matricula.controller';
import { EstudianteModule } from '../estudiante/estudiante.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MatriculaOrmEntity]),
    EstudianteModule,
    AuthModule,
  ],
  controllers: [MatriculaController],
  providers: [
    MatriculaService,
    { provide: I_MATRICULA_REPOSITORY, useClass: MatriculaRepository },
  ],
  exports: [MatriculaService, I_MATRICULA_REPOSITORY],
})
export class MatriculaModule {}
