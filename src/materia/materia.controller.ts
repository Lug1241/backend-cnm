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
import { MateriaService } from '@application/services/materia.service';
import { CreateMateriaDto } from '@application/dtos/materia/create-materia.dto';
import { UpdateMateriaDto } from '@application/dtos/materia/update-materia.dto';
import { NivelMateria, TipoMateria } from '@domain/entities/materia.entity';

@Controller('api/materia')
export class MateriaController {
  constructor(private readonly materiaService: MateriaService) {}

  @Post('crear')
  async create(@Body() createDto: CreateMateriaDto) {
    return this.materiaService.create(createDto);
  }

  @Put('editar/:id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateMateriaDto) {
    return this.materiaService.update(+id, updateDto);
  }

  @Get('obtener/:id')
  async getMateria(@Param('id') id: string) {
    return this.materiaService.getById(+id);
  }

  @Get('obtener')
  async getMaterias(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search: string = '',
  ) {
    return this.materiaService.getAll(+page, +limit, search);
  }

  @Get('obtener/nivel/:tipoNivel')
  async getNivel(
    @Param('tipoNivel') nivel: NivelMateria,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.materiaService.getByLevel(nivel, +page, +limit);
  }

  @Get('obtener/tipo/:tipo')
  async getTipo(
    @Param('tipo') tipo: TipoMateria,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.materiaService.getByType(tipo, +page, +limit);
  }

  @Get('obtener/nombre/:nombre')
  async getNombre(@Param('nombre') nombre: string) {
    return this.materiaService.getByName(nombre);
  }

  @Delete('eliminar/:id')
  async deleteMateria(@Param('id') id: string) {
    return this.materiaService.delete(+id);
  }
}
