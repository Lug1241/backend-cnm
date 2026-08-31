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
import { RepresentanteService } from '@application/services/representante.service';
import { CreateRepresentanteDto } from '@application/dtos/create-representante.dto';
import { UpdateRepresentanteDto } from '@application/dtos/update-representante.dto';

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
)
@Controller('api/representantes')
export class RepresentanteController {
  constructor(private readonly representanteService: RepresentanteService) {}

  @Post('crear')
  async createRepresentante(@Body() createDto: CreateRepresentanteDto) {
    return this.representanteService.create(createDto);
  }

  @Put('editar/:cedula')
  async editRepresentante(
    @Param('cedula') cedula: string,
    @Body() updateDto: UpdateRepresentanteDto,
  ) {
    return this.representanteService.update(cedula, updateDto);
  }

  @Get('obtener/:cedula')
  async getRepresentante(@Param('cedula') cedula: string) {
    return this.representanteService.getByCedula(cedula);
  }

  @Get('obtener')
  async getRepresentantes(
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

    return this.representanteService.getAll(page, limit, search);
  }

  @Delete('eliminar/:cedula')
  async eliminarRepresentante(@Param('cedula') cedula: string) {
    return this.representanteService.delete(cedula);
  }
}
