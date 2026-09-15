import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseEnumPipe,
  Res,
} from '@nestjs/common';
import { existsSync } from 'node:fs';
import type { Response } from 'express';
import { ArchivoService } from './archivo.service';
import { CarpetaArchivo } from './archivo.types';

@Controller('api/archivos')
export class ArchivoController {
  constructor(private readonly archivoService: ArchivoService) {}

  @Get(':carpeta/:nombre')
  descargar(
    @Param('carpeta', new ParseEnumPipe(CarpetaArchivo))
    carpeta: CarpetaArchivo,
    @Param('nombre') nombre: string,
    @Res() response: Response,
  ) {
    const ruta = this.archivoService.resolverDescarga(carpeta, nombre);
    if (!existsSync(ruta)) throw new NotFoundException('Archivo no encontrado');

    response.download(ruta, nombre);
  }
}
