import { CreateAsignacionDto } from '@application/dtos/asignacion/create-asignacion.dto';
import { UpdateAsignacionDto } from '@application/dtos/update-asignacion.dto';
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
} from '@nestjs/common';

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
    return this.asignacionService.delete(id);
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

  @Get('nivel/:nivel/:periodo')
  async getAsignacionesPorNivel(
    @Param('nivel') nivel: string,
    @Param('periodo', ParseIntPipe) periodo: number,
  ) {
    return this.asignacionService.getByNivelMateria(nivel as any, periodo);
  }

  @Get('obtener/periodo/:periodo')
  async getAsignaciones(
    @Param('periodo', ParseIntPipe) periodo: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(13), ParseIntPipe) limit: number,
    @Query('search', new DefaultValuePipe('')) search: string,
  ) {
    return this.asignacionService.getAll(page, limit, search, periodo);
  }

  @Get('obtener/periodo_academico/:periodo')
  async getAsignacionesPorPeriodo(
    @Param('periodo', ParseIntPipe) periodo: number,
  ) {
    return this.asignacionService.getByPeriodo(periodo);
  }

  @Get('obtener/materias/:periodo/:nivel/:materia/:jornada')
  async getAsignacionesPorAsignatura(
    @Param('periodo', ParseIntPipe) periodo: number,
    @Param('nivel') nivel: string,
    @Param('materia') materia: string,
    @Param('jornada') jornada: string,
  ) {
    return this.asignacionService.getByMateria(
      periodo,
      nivel as any,
      materia,
      jornada as any,
    );
  }

  @Get('obtener/docente/:id_docente/:periodo')
  async getAsignacionesSinMatriculaPorDocente(
    @Param('id_docente', ParseIntPipe) idDocente: number,
    @Param('periodo', ParseIntPipe) periodo: number,
  ) {
    return this.asignacionService.getByDocenteSinMatricula(idDocente, periodo);
  }

  @Get('sinMatricula')
  async getAsignacionesSinMatricula() {
    return this.asignacionService.getSinMatricula();
  }
}
