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
  Res,
  NotFoundException,
} from '@nestjs/common';
import { EstudianteService } from '@application/services/estudiante.service';
import { CreateEstudianteDto } from '@application/dtos/estudiante/create-estudiante.dto';
import { UpdateEstudianteDto } from '@application/dtos/estudiante/update-estudiante.dto';
import { NivelEstudiante } from '@domain/entities/estudiante.entity';
import type { Response } from 'express';
import { ZipArchive } from 'archiver';
import { existsSync } from 'node:fs';
import { basename, isAbsolute, relative, resolve, sep } from 'node:path';

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

    @Query('nivel')
    nivel?: string,
  ) {
    if (page < 1 || limit < 1) {
      throw new BadRequestException(
        'La página y el límite deben ser mayores que cero',
      );
    }

    let nivelValidado: NivelEstudiante | undefined;
    if (nivel) {
      if (!Object.values(NivelEstudiante).includes(nivel as NivelEstudiante)) {
        throw new BadRequestException('El nivel no es válido');
      }
      nivelValidado = nivel as NivelEstudiante;
    }

    return this.estudianteService.getAll(page, limit, search, nivelValidado);
  }

  @Get('representante/:cedula')
  async getEstudiantesByRepresentante(@Param('cedula') cedula: string) {
    return this.estudianteService.getByRepresentanteCedula(cedula);
  }

  @Get('obtenerPorApellido')
  async getEstudiantesByApellido(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number = 1,

    @Query('limit', new DefaultValuePipe(10), ParseIntPipe)
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

  @Get('archivos/:nivel/:tipo')
  async downloadFilesByLevel(
    @Param('nivel', new ParseEnumPipe(NivelEstudiante))
    nivel: NivelEstudiante,
    @Param(
      'tipo',
      new ParseEnumPipe({
        CEDULAS_REPRESENTANTES: 'cedulas-representantes',
        CROQUIS: 'croquis',
        CEDULAS_ESTUDIANTES: 'cedulas-estudiantes',
        MATRICULAS_IER: 'matriculas-ier',
      }),
    )
    tipo:
      | 'cedulas-representantes'
      | 'croquis'
      | 'cedulas-estudiantes'
      | 'matriculas-ier',
    @Res() response: Response,
  ) {
    const rutasGuardadas = await this.estudianteService.getArchivosPorNivel(
      nivel,
      tipo,
    );

    if (rutasGuardadas.length === 0) {
      throw new NotFoundException(
        'No hay documentos registrados para el nivel y tipo seleccionados',
      );
    }

    const uploadRoot = resolve(
      process.env.UPLOADS_ROOT ?? resolve(process.cwd(), 'uploads'),
    );
    const disponibles: { ruta: string; nombre: string }[] = [];
    const faltantes: string[] = [];

    for (const rutaGuardada of rutasGuardadas) {
      const ruta = this.resolveStoredUploadPath(uploadRoot, rutaGuardada);
      if (!ruta || !existsSync(ruta)) {
        faltantes.push(basename(rutaGuardada.replace(/\\/g, '/')));
        continue;
      }
      disponibles.push({ ruta, nombre: basename(ruta) });
    }

    if (disponibles.length === 0) {
      throw new NotFoundException(
        'Los documentos están registrados, pero no existen en el almacenamiento configurado',
      );
    }

    const nombreNivel = nivel
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();

    response.setHeader('Content-Type', 'application/zip');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${tipo}-${nombreNivel}.zip"`,
    );

    const archive = new ZipArchive({ zlib: { level: 9 } });
    archive.on('error', (error) => response.destroy(error));
    archive.pipe(response);

    for (const archivo of disponibles) {
      archive.file(archivo.ruta, { name: archivo.nombre });
    }

    if (faltantes.length > 0) {
      archive.append(
        `No se encontraron los siguientes archivos:\n${faltantes.join('\n')}`,
        { name: 'ARCHIVOS_NO_ENCONTRADOS.txt' },
      );
    }

    await archive.finalize();
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

  private resolveStoredUploadPath(
    uploadRoot: string,
    storedPath: string,
  ): string | null {
    const segments = storedPath.replace(/\\/g, '/').split('/').filter(Boolean);
    const uploadsIndex = segments.findIndex(
      (segment) => segment.toLowerCase() === 'uploads',
    );
    const relativeSegments =
      uploadsIndex >= 0 ? segments.slice(uploadsIndex + 1) : segments;

    if (relativeSegments.length === 0) return null;

    const candidate = resolve(uploadRoot, ...relativeSegments);
    const relativePath = relative(uploadRoot, candidate);
    if (
      relativePath === '' ||
      relativePath === '..' ||
      relativePath.startsWith(`..${sep}`) ||
      isAbsolute(relativePath)
    ) {
      return null;
    }

    return candidate;
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
