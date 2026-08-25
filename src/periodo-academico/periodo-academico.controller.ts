import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { PeriodoAcademicoService } from '@application/services/periodo-academico.service';
import { CreatePeriodoDto } from '@application/dtos/create-periodo.dto';
import { UpdatePeriodoDto } from '@application/dtos/update-periodo.dto';

@Controller('api/periodo_academico')
export class PeriodoAcademicoController {
  constructor(private readonly periodoService: PeriodoAcademicoService) {}

  @Post('crear')
  async createPeriodo(@Body() createDto: CreatePeriodoDto) {
    return this.periodoService.create(createDto);
  }

  @Put('editar/:id')
  async updatePeriodo(
    @Param('id') id: string,
    @Body() updateDto: UpdatePeriodoDto,
  ) {
    return this.periodoService.update(+id, updateDto);
  }

  @Get('obtener/:id')
  async getPeriodo(@Param('id') id: string) {
    return this.periodoService.getById(+id);
  }

  @Get('obtener')
  async getPeriodos(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '13',
    @Query('search') search: string = '',
  ) {
    return this.periodoService.getAll(+page, +limit, search);
  }

  @Get('activo')
  async getPeriodoActivo() {
    return this.periodoService.getActive();
  }

  @Delete('eliminar/:id')
  async deletePeriodo(@Param('id') id: string) {
    return this.periodoService.delete(+id);
  }
}
