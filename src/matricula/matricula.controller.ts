import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { MatriculaService } from '@application/services/matricula.service';
import { CreateMatriculaDto } from '@application/dtos/create-matricula.dto';
import { UpdateMatriculaDto } from '@application/dtos/update-matricula.dto';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('api/matriculas')
export class MatriculaController {
  constructor(private readonly matriculaService: MatriculaService) {}

  @Post('crear')
  create(@Body() dto: CreateMatriculaDto) {
    return this.matriculaService.create(dto);
  }

  @Put('editar/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMatriculaDto,
  ) {
    return this.matriculaService.update(id, dto);
  }

  @Get('obtener/:id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.matriculaService.getById(id);
  }

  @Get('estudiante/periodo/:estudiante/:periodo')
  async getByEstudianteYPeriodo(
    @Param('estudiante', ParseIntPipe) estudianteId: number,
    @Param('periodo', ParseIntPipe) periodoAcademicoId: number,
    @Res() response: Response,
  ) {
    const matricula = await this.matriculaService.getByEstudianteYPeriodo(
      estudianteId,
      periodoAcademicoId,
    );
    // El flujo anterior espera JSON null con estado 200 si aún no está matriculado.
    return response.json(matricula);
  }

  @Get('estudiante/:estudiante')
  getPeriodosByEstudiante(
    @Param('estudiante', ParseIntPipe) estudianteId: number,
  ) {
    return this.matriculaService.getPeriodosByEstudiante(estudianteId);
  }

  @Delete('eliminar/:id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.matriculaService.delete(id);
  }
}
