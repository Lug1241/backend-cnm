import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { SolicitudService } from '@application/services/solicitud.service';
import { CreateSolicitudDto } from '@application/dtos/create-solicitud.dto';
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

  @Get('docente/:cedula')
  async getSolicitudesByDocente(@Param('cedula') cedula: string) {
    return this.solicitudService.getByDocente(cedula);
  }

  @Get('ultima-aceptada/:cedula')
  async getUltimaSolicitud(@Param('cedula') cedula: string) {
    return this.solicitudService.getLastAcceptedByDocente(cedula);
  }

  @Delete('eliminar/:id')
  async deleteSolicitud(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.delete(id);
  }
}
