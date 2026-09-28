import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from '../application/services/auth.service';

import { DocenteModule } from '../docente/docente.module';
import { RepresentanteModule } from '../representante/representante.module';

import { JwtAuthGuard } from './jwt-auth.guard';
import { SecretariaGuard } from './secretaria.guard';

@Module({
  imports: [
    DocenteModule,
    RepresentanteModule,

    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '30d',
        },
      }),
    }),
  ],

  controllers: [AuthController],

  providers: [AuthService, JwtAuthGuard, SecretariaGuard],

  exports: [AuthService, JwtAuthGuard, SecretariaGuard],
})
export class AuthModule {}
