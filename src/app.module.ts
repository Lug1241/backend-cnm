import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DocenteModule } from './docente/docente.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { PeriodoAcademicoModule } from './periodo-academico/periodo-academico.module';
import { MailModule } from './infrastructure/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    PeriodoAcademicoModule,
    DocenteModule,
    MailModule,
  ],
})
export class AppModule {}
