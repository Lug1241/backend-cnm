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
  ParseEnumPipe,
} from '@nestjs/common';
import { FechaProcesoService } from '../application/services/fecha.service';
import { CreateFechaProcesoDto } from '@application/dtos/fecha/create-fecha.dto';
import { UpdateFechaProcesoDto } from '@application/dtos/fecha/update-fecha.dto';
import { TipoProceso } from '@domain/entities/fecha-proceso.entity';

@Controller('api/fechas_procesos')
export class FechaProcesoController {
  constructor(private readonly fechaProcesoService: FechaProcesoService) {}

  @Post('crear')
  create(@Body() createDto: CreateFechaProcesoDto) {
    return this.fechaProcesoService.create(createDto);
  }

  @Put('editar/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateFechaProcesoDto,
  ) {
    return this.fechaProcesoService.update(id, updateDto);
  }

  @Delete('eliminar/:id')
  async deleteFechaProceso(
    @Param('id', ParseIntPipe) id: number,
    @Query('proceso', new ParseEnumPipe(TipoProceso, { optional: true }))
    proceso?: TipoProceso,
  ) {
    return this.fechaProcesoService.delete(id, proceso);
  }

  @Get('matricula')
  verificarMatricula() {
    return this.fechaProcesoService.verificarPeriodoMatricula();
  }

  @Get('obtener/:id')
  async getFechaProceso(
    @Param('id', ParseIntPipe) id: number,
    @Query('proceso', new ParseEnumPipe(TipoProceso, { optional: true }))
    proceso?: TipoProceso,
  ) {
    return this.fechaProcesoService.getById(id, proceso);
  }

  @Get('obtener')
  async getFechas(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.fechaProcesoService.getAll(page, limit, search);
  }
}
