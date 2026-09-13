import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { basename, isAbsolute, relative, resolve, sep } from 'node:path';
import {
  type ArchivoPdfSubido,
  type ArchivosPdfSubidos,
  CarpetaArchivo,
} from './archivo.types';

@Injectable()
export class ArchivoService {
  private readonly uploadRoot = resolve(
    process.env.UPLOADS_ROOT ?? resolve(process.cwd(), 'uploads'),
  );

  async guardarArchivos(
    carpeta: CarpetaArchivo,
    identificador: string,
    archivos: ArchivosPdfSubidos | undefined,
  ): Promise<Record<string, string>> {
    if (!archivos) return {};

    const resultado: Record<string, string> = {};
    const archivosGuardados: string[] = [];

    try {
      for (const [campo, lista] of Object.entries(archivos)) {
        const archivo = lista[0];
        if (!archivo) continue;
        if (!archivo.buffer.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
          throw new BadRequestException(
            'El contenido del archivo no es un PDF',
          );
        }

        const nombre = this.crearNombreArchivo(identificador, campo, archivo);
        const directorio = resolve(this.uploadRoot, carpeta);
        const rutaAbsoluta = resolve(directorio, nombre);

        await mkdir(directorio, { recursive: true });
        await writeFile(rutaAbsoluta, archivo.buffer, { flag: 'wx' });

        const rutaGuardada = `uploads/${carpeta}/${nombre}`;
        resultado[campo] = rutaGuardada;
        archivosGuardados.push(rutaGuardada);
      }

      return resultado;
    } catch (error) {
      await Promise.all(
        archivosGuardados.map((ruta) => this.eliminarArchivo(ruta)),
      );
      throw error;
    }
  }

  resolverRutaGuardada(rutaGuardada: string): string | null {
    const segmentos = rutaGuardada
      .replace(/\\/g, '/')
      .split('/')
      .filter(Boolean);
    const indiceUploads = segmentos.findIndex(
      (segmento) => segmento.toLowerCase() === 'uploads',
    );
    const segmentosRelativos =
      indiceUploads >= 0 ? segmentos.slice(indiceUploads + 1) : segmentos;

    if (segmentosRelativos.length === 0) return null;

    const candidata = resolve(this.uploadRoot, ...segmentosRelativos);
    const rutaRelativa = relative(this.uploadRoot, candidata);

    if (
      rutaRelativa === '' ||
      rutaRelativa === '..' ||
      rutaRelativa.startsWith(`..${sep}`) ||
      isAbsolute(rutaRelativa)
    ) {
      return null;
    }

    return candidata;
  }

  resolverDescarga(carpeta: CarpetaArchivo, nombre: string): string {
    if (basename(nombre) !== nombre || !nombre.toLowerCase().endsWith('.pdf')) {
      throw new NotFoundException('Archivo no encontrado');
    }

    const ruta = this.resolverRutaGuardada(`uploads/${carpeta}/${nombre}`);
    if (!ruta) throw new NotFoundException('Archivo no encontrado');

    return ruta;
  }

  async eliminarArchivo(rutaGuardada?: string | null): Promise<void> {
    if (!rutaGuardada) return;

    const ruta = this.resolverRutaGuardada(rutaGuardada);
    if (!ruta) return;

    await rm(ruta, { force: true });
  }

  private crearNombreArchivo(
    identificador: string,
    campo: string,
    archivo: ArchivoPdfSubido,
  ): string {
    const identificadorSeguro = this.limpiarSegmento(identificador);
    const campoSeguro = this.limpiarSegmento(campo);
    const nombreOriginal = this.limpiarSegmento(
      basename(archivo.originalname, '.pdf'),
    ).slice(0, 100);
    const sufijo = randomUUID().slice(0, 8);

    return `${identificadorSeguro}_${campoSeguro}_${Date.now()}_${sufijo}_${nombreOriginal}.pdf`;
  }

  private limpiarSegmento(valor: string): string {
    const limpio = valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return limpio || 'archivo';
  }
}
