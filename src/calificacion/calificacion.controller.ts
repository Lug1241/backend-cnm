import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CalificacionService } from '@application/services/calificacion.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SecretariaGuard } from '../auth/secretaria.guard';
import { RepresentanteGuard } from '../auth/representante.guard';
import { type AuthenticatedRequest } from '../auth/jwt-auth.guard';

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

  @Get('representante/matricula/:idMatricula')
  @UseGuards(JwtAuthGuard, RepresentanteGuard)
  getReporteByMatriculaForRepresentante(
    @Param('idMatricula', ParseIntPipe) idMatricula: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.calificacionService.getReporteByMatriculaForRepresentante(
      idMatricula,
      request.user.id,
    );
  }
}
