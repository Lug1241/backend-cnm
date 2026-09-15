export enum CarpetaArchivo {
  ESTUDIANTES = 'Estudiantes',
  REPRESENTANTES = 'Representantes',
}

export interface ArchivoPdfSubido {
  fieldname: string;
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

export type ArchivosPdfSubidos = Record<string, ArchivoPdfSubido[]>;
