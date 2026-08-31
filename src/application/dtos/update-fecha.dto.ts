import { PartialType } from '@nestjs/mapped-types';
import { CreateFechaProcesoDto } from './create-fecha.dto';

export class UpdateFechaProcesoDto extends PartialType(CreateFechaProcesoDto) {}
