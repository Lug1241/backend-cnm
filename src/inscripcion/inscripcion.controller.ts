import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { InscripcionService } from '@application/services/inscripcion.service';
import { CreateInscripcionDto } from '@application/dtos/inscripcion/create-inscripcion.dto';
import { UpdateInscripcionDto } from '@application/dtos/inscripcion/update-inscripcion.dto';
import {
  type AuthenticatedRequest,
  JwtAuthGuard,
} from '../auth/jwt-auth.guard';
import { RepresentanteGuard } from '../auth/representante.guard';
import { SecretariaGuard } from '../auth/secretaria.guard';
import { type AuthPayload } from '../auth/auth.types';
import { type Request } from 'express';

interface RequestWithOptionalUser extends Request {
  user?: Pick<AuthPayload, 'rol'>;
}

// TODO: implementar JwtAuthGuard cuando exista para usar req.user?.rol
@Controller('api/inscripcion')
export class InscripcionController {
  constructor(private readonly inscripcionService: InscripcionService) {}

  @Post('crear')
  async createInscripcion(
    @Body() dto: CreateInscripcionDto,
    @Req() req: RequestWithOptionalUser,
  ) {
    const rolUsuario = req.user?.rol || '';
    return await this.inscripcionService.create(dto, rolUsuario);
  }

  @Put('editar/:id')
  async updateInscripcion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInscripcionDto,
    @Req() req: RequestWithOptionalUser,
  ) {
    const rolUsuario = req.user?.rol || '';
    const result = await this.inscripcionService.update(id, dto, rolUsuario);
    return { success: result };
  }

  @Get('obtener/:id')
  async getInscripcion(@Param('id', ParseIntPipe) id: number) {
    return await this.inscripcionService.getById(id);
  }

  @Delete('eliminar/:id')
  async deleteInscripcion(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithOptionalUser,
  ) {
    const rolUsuario = req.user?.rol || '';
    await this.inscripcionService.delete(id, rolUsuario);
    return { message: 'Inscripción eliminada correctamente' };
  }

  @Get('asignacion/:id_asignacion')
  async getEstudiantesPorAsignacion(
    @Param('id_asignacion', ParseIntPipe) idAsignacion: number,
  ) {
    return await this.inscripcionService.getEstudiantesPorAsignacion(
      idAsignacion,
    );
  }

  @Get('asignaciones')
  @UseGuards(JwtAuthGuard, SecretariaGuard)
  getEstudiantesPorAsignaciones(@Query('ids') idsRaw?: string) {
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

    return this.inscripcionService.getEstudiantesPorAsignaciones(ids);
  }

  @Get('obtener/matricula/:matricula')
  async getInscripcionesByMatricula(
    @Param('matricula', ParseIntPipe) matricula: number,
  ) {
    return await this.inscripcionService.getInscripcionesByMatricula(matricula);
  }

  @Get('representante/matricula/:matricula')
  @UseGuards(JwtAuthGuard, RepresentanteGuard)
  getHorarioByMatriculaForRepresentante(
    @Param('matricula', ParseIntPipe) matricula: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.inscripcionService.getHorarioByMatriculaForRepresentante(
      matricula,
      request.user.id,
    );
  }

  @Get('obtener/docente/:docente/:periodo')
  async getInscripcionesIndividualesDocente(
    @Param('docente') docente: string,
    @Param('periodo', ParseIntPipe) periodo: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.inscripcionService.getInscripcionesIndividualesDocente(
      docente,
      periodo,
      page,
      limit,
    );
  }

  @Get('obtener/nivel/:periodo/:nivel')
  async getInscripcionesIndividualesByNivel(
    @Param('periodo', ParseIntPipe) periodo: number,
    @Param('nivel') nivel: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.inscripcionService.getInscripcionesIndividualesByNivel(
      nivel,
      periodo,
      page,
      limit,
    );
  }
}
