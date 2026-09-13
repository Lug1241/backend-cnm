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
    DefaultValuePipe, 
    Req,
} from '@nestjs/common';
import { InscripcionService } from '@application/services/inscripcion.service';
import { CreateInscripcionDto } from '@application/dtos/inscripcion/create-inscripcion.dto';
import { UpdateInscripcionDto } from '@application/dtos/inscripcion/update-inscripcion.dto';

//TODO: implementar JwtAuthGuard cuando exista para usar req.user?.rol
@Controller('api/inscripcion')
export class InscripcionController {
    constructor(private readonly inscripcionService: InscripcionService) {}

    @Post('crear')
    async createInscripcion(
        @Body() dto: CreateInscripcionDto, 
        @Req() req: any
    ) {
        const rolUsuario = req.user?.rol || ''; 
        return await this.inscripcionService.create(dto, rolUsuario);
    }

    @Put('editar/:id')
    async updateInscripcion(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateInscripcionDto,
        @Req() req: any
    ) {
        const rolUsuario = req.user?.rol || '';
        const result = await this.inscripcionService.update(id, dto, rolUsuario);
        return { success: result };
    }

    @Get('obtener/:id')
    async getInscripcion(@Param('id', ParseIntPipe) id: number) {
        return await this.inscripcionService.getById(id);
    }

    @Delete('eliminar/:id')
    async deleteInscripcion(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: any
    ) {
        const rolUsuario = req.user?.rol || '';
        await this.inscripcionService.delete(id, rolUsuario);
        return { message: 'Inscripción eliminada correctamente' };
    }

    @Get('asignacion/:id_asignacion')
    async getEstudiantesPorAsignacion(
        @Param('id_asignacion', ParseIntPipe) idAsignacion: number
    ) {
        return await this.inscripcionService.getEstudiantesPorAsignacion(idAsignacion);
    }

    @Get('obtener/matricula/:matricula')
    async getInscripcionesByMatricula(
        @Param('matricula', ParseIntPipe) matricula: number
    ) {
        return await this.inscripcionService.getInscripcionesByMatricula(matricula);
    }

    @Get('obtener/docente/:docente/:periodo')
    async getInscripcionesIndividualesDocente(
        @Param('docente') docente: string,
        @Param('periodo', ParseIntPipe) periodo: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ) {
        return await this.inscripcionService.getInscripcionesIndividualesDocente(
            docente, 
            periodo, 
            page,
            limit,
        );
    }

    @Get('obtener/nivel/:periodo/:nivel')
    async getInscripcionesIndividualesByNivel(
        @Param('periodo', ParseIntPipe) periodo: number,
        @Param('nivel') nivel: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number 
    ) {
        return await this.inscripcionService.getInscripcionesIndividualesByNivel(
            nivel, 
            periodo,
            page,
            limit
        );
    }
}