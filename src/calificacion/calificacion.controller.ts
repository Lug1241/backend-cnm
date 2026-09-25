import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
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

  @Get('reporte/asignaciones')
  @UseGuards(JwtAuthGuard, SecretariaGuard)
  getReporteByAsignaciones(@Query('ids') idsRaw?: string) {
    if (!idsRaw?.trim()) {
      throw new BadRequestException(
        'Debe proporcionar al menos una asignación',
      );
    }

    const ids = [
      ...new Set(idsRaw.split(',').map((value) => Number(value.trim()))),
    ];

    if (ids.some((id) => !Number.isSafeInteger(id) || id < 1)) {
      throw new BadRequestException(
        'Los IDs de asignación deben ser enteros mayores que cero',
      );
    }

    return this.calificacionService.getReporteByAsignaciones(ids);
  }
}
