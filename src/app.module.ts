import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './infrastructure/database/database.module';
import { PeriodoAcademicoModule } from './periodo-academico/periodo-academico.module';
import { MateriaModule } from './materia/materia.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    PeriodoAcademicoModule,
    MateriaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
