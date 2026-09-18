import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudOrmEntity } from '@infrastructure/database/entitites/solicitud.orm-entity';
import { SolicitudController } from './solicitud.controller';
import { SolicitudService } from '@application/services/solicitud.service';
import { SolicitudRepository } from '@infrastructure/repositories/solicitud.repository';
import { I_SOLICITUD_REPOSITORY } from '@domain/interfaces/solicitud.repository.interface';
import { DocenteModule } from 'src/docente/docente.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([SolicitudOrmEntity]),
    DocenteModule,
],
  controllers: [SolicitudController],
  providers: [
    SolicitudService,
    {
      provide: I_SOLICITUD_REPOSITORY,
      useClass: SolicitudRepository,
    },
  ],
  exports: [I_SOLICITUD_REPOSITORY],
})
export class SolicitudModule {}
