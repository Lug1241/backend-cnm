import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CalificacionService } from '@application/services/calificacion.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SecretariaGuard } from '../auth/secretaria.guard';

@Controller('api/calificaciones')
export class CalificacionController {
  constructor(private readonly calificacionService: CalificacionService) {}

  @Get('reporte/matricula/:idMatricula')
  @UseGuards(JwtAuthGuard, SecretariaGuard)
  getReporteByMatricula(
    @Param('idMatricula', ParseIntPipe) idMatricula: number,
  ) {
    return this.calificacionService.getReporteByMatricula(idMatricula);
  }
}
