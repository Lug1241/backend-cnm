import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { SolicitudService } from '@application/services/solicitud.service';
import { CreateSolicitudDto } from '@application/dtos/solicitud/create-solicitud.dto';
import { UpdateSolicitudDto } from '@application/dtos/solicitud/update-solicitud.dto';

@Controller('api/solicitudes')
export class SolicitudController {
  constructor(private readonly solicitudService: SolicitudService) {}

  @Post('crear')
  async createSolicitud(@Body() createDto: CreateSolicitudDto) {
    return this.solicitudService.create(createDto);
  }

  @Put('editar/:id')
  async editSolicitud(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSolicitudDto,
  ) {
    return this.solicitudService.update(id, updateDto);
  }

  @Get('obtener')
  async getAllSolicitudes() {
    return this.solicitudService.getAll();
  }

  @Get('docente')
  async getSolicitudesByDocente(
    @Query('docenteId') docenteId?: number,
    @Query('cedula') cedula?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    if (!docenteId && !cedula) {
      throw new BadRequestException('Debe proporcionar un ID o una cédula para buscar las solicitudes');
    }

    return this.solicitudService.getByConditions(docenteId, cedula, fechaInicio, fechaFin);
  }

  @Get('ultima-aceptada')
  async getUltimaSolicitud(
    @Query('docenteId') docenteId?: number,
    @Query('cedula') cedula?: string,
  ) {
    if (!docenteId && !cedula) {
      throw new BadRequestException('Debe proporcionar un ID o una cédula para buscar la última solicitud aprobada.');
    }

    return this.solicitudService.getLastAcceptedByDocente(docenteId, cedula);
  }

  @Delete('eliminar/:id')
  async deleteSolicitud(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.delete(id);
  }
}
