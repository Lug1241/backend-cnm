import {
  Controller,
  Get,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  DefaultValuePipe,
  ParseIntPipe,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { EstudianteService } from '@application/services/estudiante.service';
import { CreateEstudianteDto } from '@application/dtos/create-estudiante.dto';
import { UpdateEstudianteDto } from '@application/dtos/update-estudiante.dto';

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
)
@Controller('api/estudiantes')
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) {}

  @Post('crear')
  async createEstudiante(@Body() createDto: CreateEstudianteDto) {
    return this.estudianteService.create(createDto);
  }

  @Put('editar/:cedula')
  async editEstudiante(
    @Param('cedula') cedula: string,
    @Body() updateDto: UpdateEstudianteDto,
  ) {
    return this.estudianteService.update(cedula, updateDto);
  }

  @Get('obtener/:cedula')
  async getEstudiante(@Param('cedula') cedula: string) {
    return this.estudianteService.getByCedula(cedula);
  }

  @Get('obtener')
  async getEstudiantes(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number,

    @Query('limit', new DefaultValuePipe(10), ParseIntPipe)
    limit: number,

    @Query('search')
    search: string = '',
  ) {
    if (page < 1 || limit < 1) {
      throw new BadRequestException(
        'La página y el límite deben ser mayores que cero',
      );
    }

    return this.estudianteService.getAll(page, limit, search);
  }

  @Delete('eliminar/:cedula')
  async eliminarEstudiante(@Param('cedula') cedula: string) {
    return this.estudianteService.delete(cedula);
  }
}
