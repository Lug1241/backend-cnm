import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoSolicitud } from '../../domain/entities/solicitud.entity';
import { CreateSolicitudDto } from './create-solicitud.dto';

export class UpdateSolicitudDto extends PartialType(CreateSolicitudDto) {
  @IsOptional()
  @IsEnum(EstadoSolicitud)
  estado?: EstadoSolicitud;
}
