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
} from '@nestjs/common';
import { DocenteService } from '@application/services/docente.service';
import { CreateDocenteDto } from '@application/dtos/create-docente.dto';
import { UpdateDocenteDto } from '@application/dtos/update-docente.dto';

@Controller('api/docentes')
export class DocenteController {
  constructor(private readonly docenteService: DocenteService) {}

  @Post('crear')
  async createDocente(@Body() createDto: CreateDocenteDto) {
    return this.docenteService.create(createDto);
  }

  @Put('editar/:cedula')
  async editDocente(
    @Param('cedula') cedula: string,
    @Body() updateDto: UpdateDocenteDto,
  ) {
    return this.docenteService.update(cedula, updateDto);
  }

  @Get('obtener/:id')
  async getDocenteByID(@Param('id', ParseIntPipe) id: number) {
    return this.docenteService.getByID(id);
  }

  @Get('obtener/:cedula')
  async getDocente(@Param('cedula') cedula: string) {
    return this.docenteService.getByCedula(cedula);
  }

  @Get('obtener')
  async getDocentes(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search: string = '',
  ) {
    return this.docenteService.getAll(+page, +limit, search);
  }

  @Delete('eliminar/:cedula')
  async eliminarDocente(@Param('cedula') cedula: string) {
    return this.docenteService.delete(cedula);
  }
}
