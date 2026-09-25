import { CreateAsignacionDto } from '@application/dtos/asignacion/create-asignacion.dto';
import { UpdateAsignacionDto } from '@application/dtos/asignacion/update-asignacion.dto';
import { AsignacionService } from '@application/services/asignacion.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SecretariaGuard } from '../auth/secretaria.guard';
import { TipoMateria } from '@domain/entities/materia.entity';

@Controller('api/asignaciones')
export class AsignacionController {
  constructor(private readonly asignacionService: AsignacionService) {}

  @Post('crear')
  async create(@Body() createDto: CreateAsignacionDto) {
    return this.asignacionService.create(createDto);
  }

  @Put('editar/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAsignacionDto,
  ) {
    return this.asignacionService.update(id, updateDto);
  }

  @Delete('eliminar/:id')
  async deleteAsignacion(@Param('id', ParseIntPipe) id: number) {
    await this.asignacionService.delete(id);
    return { success: true, message: 'Asignación eliminada correctamente' };
  }

  @Get('obtener/:id')
  async getAsignacion(@Param('id', ParseIntPipe) id: number) {
    return this.asignacionService.getById(id);
  }

  @Get('docente/:id_docente')
  async getAsignacionesPorDocente(
    @Param('id_docente', ParseIntPipe) idDocente: number,
  ) {
    return this.asignacionService.getByDocente(idDocente);
  }

  @Get('obtener/periodo/:periodo')
  async getAsignaciones(
    @Param('periodo', ParseIntPipe) periodo: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search', new DefaultValuePipe('')) search: string,
    @Query('grupo', new DefaultValuePipe('')) grupo: string,
  ) {
    return this.asignacionService.getAll(page, limit, search, periodo, grupo);
  }

  @Get('obtener/periodo_academico/:periodo')
  async getAsignacionesPorPeriodo(
    @Param('periodo', ParseIntPipe) periodo: number,
  ) {
    return this.asignacionService.getByPeriodo(periodo);
  }

  @Get('administracion-escolar/periodo/:periodo')
  @UseGuards(JwtAuthGuard, SecretariaGuard)
  async getAsignacionesAdministracionEscolar(
    @Param('periodo', ParseIntPipe) periodo: number,
  ) {
    return this.asignacionService.getByPeriodo(periodo);
  }

  @Get([
    'obtener/materias/:periodo/:nivel/:materia',
    'obtener/materias/:periodo/:nivel/:materia/:jornada',
  ])
  async getAsignacionesPorAsignatura(
    @Param('periodo', ParseIntPipe) periodo: number,
    @Param('nivel') nivel: string,
    @Param('materia') materia: string,
    @Param('jornada') jornadaPath?: string,
    @Query('jornada', new DefaultValuePipe('')) jornadaQuery: string = '',
    @Query('tipo') tipo?: TipoMateria,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number = 5,
  ) {
    if (page < 1 || limit < 1) {
      throw new BadRequestException(
        'La página y el límite deben ser mayores que cero',
      );
    }
    return this.asignacionService.getByMateria(
      periodo,
      nivel as any,
      materia,
      (jornadaPath ?? jornadaQuery) as any,
      tipo,
      page,
      limit,
    );
  }

  @Get('sinMatricula')
  async getAsignacionesSinMatricula(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('id_docente') idDocente?: string,
    @Query('periodo') periodo?: string,
  ) {
    return this.asignacionService.getSinMatricula(
      page,
      limit,
      idDocente ? +idDocente : undefined,
      periodo ? +periodo : undefined,
    );
  }
}
