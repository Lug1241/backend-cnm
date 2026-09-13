import { BadRequestException } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

const MAX_PDF_SIZE = 5 * 1024 * 1024;

export function ArchivosPdfInterceptor(campos: string[]) {
  return FileFieldsInterceptor(
    campos.map((name) => ({ name, maxCount: 1 })),
    {
      storage: memoryStorage(),
      limits: { fileSize: MAX_PDF_SIZE },
      fileFilter: (_request, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
          callback(
            new BadRequestException('Solo se permiten archivos PDF'),
            false,
          );
          return;
        }

        callback(null, true);
      },
    },
  );
}
