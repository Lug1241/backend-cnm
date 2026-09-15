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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { RepresentanteService } from '@application/services/representante.service';
import { CreateRepresentanteDto } from '@application/dtos/representante/create-representante.dto';
import { UpdateRepresentanteDto } from '@application/dtos/representante/update-representante.dto';
import { ArchivoService } from '../archivo/archivo.service';
import { PeriodoAcademicoService } from '@application/services/periodo-academico.service';
import { ArchivosPdfInterceptor } from '../archivo/archivo-upload.config';
import {
  type ArchivosPdfSubidos,
  CarpetaArchivo,
} from '../archivo/archivo.types';

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
)
@Controller('api/representantes')
export class RepresentanteController {
  constructor(
    private readonly representanteService: RepresentanteService,
    private readonly archivoService: ArchivoService,
    private readonly periodoAcademicoService: PeriodoAcademicoService,
  ) {}

  @Post('crear')
  @UseInterceptors(ArchivosPdfInterceptor(['copiaCedula', 'croquis']))
  async createRepresentante(
    @Body() createDto: CreateRepresentanteDto,
    @UploadedFiles() archivos?: ArchivosPdfSubidos,
  ) {
    if (!archivos?.copiaCedula?.[0] || !archivos?.croquis?.[0]) {
      throw new BadRequestException(
        'Falta cargar uno o más archivos PDF requeridos',
      );
    }
    const anioLectivo = await this.obtenerAnioLectivo();
    const rutas = await this.archivoService.guardarArchivos(
      CarpetaArchivo.REPRESENTANTES,
      createDto.nroCedula,
      anioLectivo,
      archivos,
    );

    createDto.cedulaPdf = rutas.copiaCedula ?? createDto.cedulaPdf;
    createDto.croquisPdf = rutas.croquis ?? createDto.croquisPdf;

    try {
      return await this.representanteService.create(createDto);
    } catch (error) {
      await this.eliminarRutas(Object.values(rutas));
      throw error;
    }
  }

  @Put('editar/:cedula')
  @UseInterceptors(ArchivosPdfInterceptor(['copiaCedula', 'croquis']))
  async editRepresentante(
    @Param('cedula') cedula: string,
    @Body() updateDto: UpdateRepresentanteDto,
    @UploadedFiles() archivos?: ArchivosPdfSubidos,
  ) {
    const anterior = await this.representanteService.getByCedula(cedula);
    const anioLectivo = await this.obtenerAnioLectivo();

    const rutas = await this.archivoService.guardarArchivos(
      CarpetaArchivo.REPRESENTANTES,
      updateDto.nroCedula ?? cedula,
      anioLectivo,
      archivos,
    );

    updateDto.cedulaPdf = rutas.copiaCedula ?? updateDto.cedulaPdf;
    updateDto.croquisPdf = rutas.croquis ?? updateDto.croquisPdf;

    try {
      const resultado = await this.representanteService.update(
        cedula,
        updateDto,
      );
      if (
        rutas.copiaCedula &&
        anterior.cedulaPdf &&
        rutas.copiaCedula !== anterior.cedulaPdf
      ) {
        await this.archivoService.eliminarArchivo(anterior.cedulaPdf);
      }

      if (
        rutas.croquis &&
        anterior.croquisPdf &&
        rutas.croquis !== anterior.croquisPdf
      ) {
        await this.archivoService.eliminarArchivo(anterior.croquisPdf);
      }
      return resultado;
    } catch (error) {
      const rutasNuevas = [
        rutas.copiaCedula && rutas.copiaCedula !== anterior.cedulaPdf
          ? rutas.copiaCedula
          : null,

        rutas.croquis && rutas.croquis !== anterior.croquisPdf
          ? rutas.croquis
          : null,
      ].filter((ruta): ruta is string => Boolean(ruta));

      await this.eliminarRutas(rutasNuevas);
      throw error;
    }
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

  private async obtenerAnioLectivo(): Promise<string> {
    const periodoActivo = await this.periodoAcademicoService.getActive();

    const anioLectivo = periodoActivo.descripcion
      .replace(/^Periodo\s*/i, '')
      .trim();

    if (!anioLectivo) {
      throw new BadRequestException(
        'El período académico activo no tiene una descripción válida',
      );
    }

    return anioLectivo;
  }
  @Delete('eliminar/:cedula')
  async eliminarRepresentante(@Param('cedula') cedula: string) {
    const representante = await this.representanteService.delete(cedula);
    await this.eliminarRutas(
      [representante.cedulaPdf, representante.croquisPdf].filter(
        (ruta): ruta is string => Boolean(ruta),
      ),
    );
    return representante;
  }

  private async eliminarRutas(rutas: string[]) {
    await Promise.all(
      rutas.map((ruta) => this.archivoService.eliminarArchivo(ruta)),
    );
  }
}
