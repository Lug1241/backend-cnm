import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DocenteModule } from './docente/docente.module';
import { RepresentanteModule } from './representante/representante.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { PeriodoAcademicoModule } from './periodo-academico/periodo-academico.module';
import { MateriaModule } from './materia/materia.module';
import { MailModule } from './infrastructure/mail/mail.module';
import { SolicitudModule } from './solicitud/solicitud.module';
import { FechaProcesoModule } from './fecha-proceso/fecha-proceso.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    PeriodoAcademicoModule,
    MateriaModule,
    DocenteModule,
    RepresentanteModule,
    MailModule,
    SolicitudModule,
    FechaProcesoModule,
  ],
})
export class AppModule {}
