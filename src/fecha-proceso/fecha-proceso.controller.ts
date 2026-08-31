import { Controller, Get, Post, Body, Param, Put, Delete, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { FechaProcesoService } from '../application/services/fecha.service';
import { CreateFechaProcesoDto } from '../application/dtos/create-fecha.dto';
import { TipoProceso } from '@domain/entities/fecha-proceso.entity';
import { UpdateFechaProcesoDto } from '@application/dtos/update-fecha.dto';

@Controller('api/fechas_procesos')
export class FechaProcesoController {
  constructor(private readonly fechaProcesoService: FechaProcesoService) {}

  @Post('crear')
  create(@Body() createDto: CreateFechaProcesoDto) {
    return this.fechaProcesoService.create(createDto);
  }

  @Put('editar/:id')
  async update(
    @Param('id', ParseIntPipe) id:number,
    @Body() updateDto: UpdateFechaProcesoDto,
  ) {
    return this.fechaProcesoService.update(id, updateDto);
  }

  @Delete('eliminar/:id')
  async deleteFechaProceso(
    @Param('id', ParseIntPipe) id:number,
  ) {
    return this.fechaProcesoService.delete(id);
  }
  
  @Get('matricula')
  verificarMatricula() {
    return this.fechaProcesoService.verificarPeriodoMatricula();
  }

  @Get('obtener/:id')
  async getFechaProceso(
    @Param('id', ParseIntPipe) id:number,
  ) {
    return this.fechaProcesoService.getById(id);
  }

  @Get('obtener')
  async getFechas(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search: TipoProceso,
  ) {
    return this.fechaProcesoService.getAll(page, limit, search)
  }
}