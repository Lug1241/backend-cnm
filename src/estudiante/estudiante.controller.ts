import {
  Controller,
  Get,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  DefaultValuePipe,
  ParseIntPipe,
  ParseEnumPipe,
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
import { NivelEstudiante } from '@domain/entities/estudiante.entity';

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

  @Get('representante/:cedula')
  async getEstudiantesByRepresentante(@Param('cedula') cedula: string) {
    return this.estudianteService.getByRepresentanteCedula(cedula);
  }

  @Get('obtenerPorApellido')
  async getEstudiantesByApellido(
    @Query('page', new ParseIntPipe({ optional: true }))
    page: number = 1,

    @Query('limit', new ParseIntPipe({ optional: true }))
    limit: number = 10,

    @Query('search')
    search: unknown = '',
  ) {
    if (page < 1 || limit < 1) {
      throw new BadRequestException(
        'La página y el límite deben ser mayores que cero',
      );
    }

    if (typeof search !== 'string') {
      throw new BadRequestException('La búsqueda debe ser una cadena de texto');
    }

    return this.estudianteService.getByApellido(page, limit, search);
  }

  @Get('nivel/:nivel')
  async getEstudiantesByNivel(
    @Param('nivel', new ParseEnumPipe(NivelEstudiante))
    nivel: NivelEstudiante,

    @Query('page')
    page?: string,

    @Query('limit')
    limit?: string,
  ) {
    const paginacion = this.parsePaginacion(page, limit);

    return this.estudianteService.getByNivel(
      nivel,
      paginacion.page,
      paginacion.limit,
    );
  }

  @Get('matricula/:nivel/periodo/:idPeriodo')
  async getEstudiantesByMatricula(
    @Param('nivel', new ParseEnumPipe(NivelEstudiante))
    nivel: NivelEstudiante,

    @Param('idPeriodo', ParseIntPipe)
    idPeriodo: number,

    @Query('page')
    page?: string,

    @Query('limit')
    limit?: string,
  ) {
    if (!Number.isSafeInteger(idPeriodo) || idPeriodo < 1) {
      throw new BadRequestException(
        'El ID del período debe ser un número entero mayor que cero',
      );
    }

    const paginacion = this.parsePaginacion(page, limit);

    return this.estudianteService.getByMatricula(
      nivel,
      idPeriodo,
      paginacion.page,
      paginacion.limit,
    );
  }

  @Get('verificar-cedula/:cedula')
  async verificarCedula(@Param('cedula') cedula: string) {
    return this.estudianteService.verificarCedulaActualizada(cedula);
  }

  @Delete('eliminar/:cedula')
  async eliminarEstudiante(@Param('cedula') cedula: string) {
    return this.estudianteService.delete(cedula);
  }

  private parsePaginacion(
    page?: string,
    limit?: string,
  ): { page?: number; limit?: number } {
    const tienePage = page !== undefined;
    const tieneLimit = limit !== undefined;

    if (tienePage !== tieneLimit) {
      throw new BadRequestException(
        'Los parámetros page y limit deben enviarse juntos',
      );
    }

    if (!tienePage && !tieneLimit) {
      return {};
    }

    if (
      typeof page !== 'string' ||
      typeof limit !== 'string' ||
      !/^\d+$/.test(page) ||
      !/^\d+$/.test(limit)
    ) {
      throw new BadRequestException(
        'La página y el límite deben ser números enteros mayores que cero',
      );
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      !Number.isSafeInteger(pageNumber) ||
      !Number.isSafeInteger(limitNumber) ||
      !Number.isSafeInteger((pageNumber - 1) * limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1
    ) {
      throw new BadRequestException(
        'La página y el límite deben ser números enteros mayores que cero',
      );
    }

    return { page: pageNumber, limit: limitNumber };
  }
}
