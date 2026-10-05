import {
  Controller,
  Put,
  Body,
  ParseEnumPipe,
  ValidationPipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
  BadRequestException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CalificacionDocenteService } from '@application/services/calificacion-docente.service';
import { UpdateCalificacionDto } from '@application/dtos/calificacion/update-calificacion.dto';
import { EtapaCalificacion } from '@domain/entities/calificacion.entity';
import { CalificacionService } from '@application/services/calificacion.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SecretariaGuard } from '../auth/secretaria.guard';
import { RepresentanteGuard } from '../auth/representante.guard';
import { type AuthenticatedRequest } from '../auth/jwt-auth.guard';

@Controller('api/calificaciones')
export class CalificacionController {
  constructor(
    private readonly calificacionService: CalificacionService,
    private readonly docenteService: CalificacionDocenteService,
  ) {}
  @Get('docente/asignaciones')
  @UseGuards(JwtAuthGuard)
  consultarDocente(
    @Query('ids') ids: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.docenteService.consultar(
      (ids ?? '').split(',').map(Number),
      req.user,
    );
  }
  @Put('inscripcion/:id/etapa/:etapa')
  @UseGuards(JwtAuthGuard)
  guardar(
    @Param('id', ParseIntPipe) id: number,
    @Param('etapa', new ParseEnumPipe(EtapaCalificacion))
    etapa: EtapaCalificacion,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: UpdateCalificacionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.docenteService.guardar(id, etapa, dto, req.user);
  }

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
