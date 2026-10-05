import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  I_CALIFICACION_REPOSITORY,
  type ICalificacionRepository,
} from '@domain/interfaces/calificacion.repository.interface';
import {
  I_ASIGNACION_REPOSITORY,
  type IAsignacionRepository,
} from '@domain/interfaces/asignacion.repository.interface';
import {
  I_INSCRIPCION_REPOSITORY,
  type IInscripcionRepository,
} from '@domain/interfaces/inscripcion.repository.interface';
import {
  I_FECHA_PROCESO_REPOSITORY,
  type IFechaProcesoRepository,
} from '@domain/interfaces/fecha-proceso.repository.interface';
import {
  EtapaCalificacion,
  TipoPlantilla,
  seleccionarPlantilla,
} from '@domain/entities/calificacion.entity';
import { TipoProceso } from '@domain/entities/fecha-proceso.entity';
import { EstadoPeriodo } from '@domain/entities/periodo-academico.entity';
import { type AuthPayload } from '../../auth/auth.types';
import { UpdateCalificacionDto } from '../dtos/calificacion/update-calificacion.dto';
import { CalificacionService } from './calificacion.service';
const descripcion: Record<EtapaCalificacion, string> = {
  Q1_P1: 'parcial1_quim1',
  Q1_P2: 'parcial2_quim1',
  Q1_EXAMEN: 'quimestre1',
  Q2_P1: 'parcial1_quim2',
  Q2_P2: 'parcial2_quim2',
  Q2_EXAMEN: 'quimestre2',
  FINAL: 'nota_final',
};
@Injectable()
export class CalificacionDocenteService {
  constructor(
    @Inject(I_CALIFICACION_REPOSITORY)
    private readonly notas: ICalificacionRepository,
    @Inject(I_ASIGNACION_REPOSITORY)
    private readonly asignaciones: IAsignacionRepository,
    @Inject(I_INSCRIPCION_REPOSITORY)
    private readonly inscripciones: IInscripcionRepository,
    @Inject(I_FECHA_PROCESO_REPOSITORY)
    private readonly fechas: IFechaProcesoRepository,
    private readonly reportes: CalificacionService,
  ) {}
  private async verificarAsignacion(id: number, user: AuthPayload) {
    if (user.type !== 'docente' || user.rol === 'Secretaria')
      throw new ForbiddenException(
        'Solo el docente del curso puede gestionar sus calificaciones',
      );
    const a = await this.asignaciones.findById(id);
    if (!a) throw new NotFoundException('La asignación no existe');
    if (a.docente?.nroCedula !== user.id)
      throw new ForbiddenException('Esta asignación no pertenece al docente');
    return a;
  }
  async consultar(ids: number[], user: AuthPayload) {
    if (
      !ids.length ||
      ids.length > 100 ||
      ids.some((id) => !Number.isSafeInteger(id) || id < 1)
    )
      throw new BadRequestException(
        'Proporcione entre 1 y 100 IDs de asignación válidos',
      );
    const unicos = [...new Set(ids)];
    await Promise.all(unicos.map((id) => this.verificarAsignacion(id, user)));
    const reporte = await this.reportes.getReporteByAsignaciones(unicos);
    const registros = await this.notas.findRegistros(
      reporte.estudiantes.map((e) => e.idInscripcion),
    );
    const { data: fechas } = await this.fechas.findAll(1, 100, [
      TipoProceso.FECHAS_NOTAS,
    ]);
    const hoy = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'America/Guayaquil',
    }).format(new Date());
    return {
      ...reporte,
      registros,
      etapasHabilitadas: Object.values(EtapaCalificacion).filter((etapa) =>
        fechas.some(
          (f) =>
            f.descripcion === descripcion[etapa] &&
            f.fechaInicio <= hoy &&
            hoy <= f.fechaFin,
        ),
      ),
    };
  }
  async guardar(
    id: number,
    etapa: EtapaCalificacion,
    dto: UpdateCalificacionDto,
    user: AuthPayload,
  ) {
    if (!Number.isSafeInteger(id) || id < 1)
      throw new BadRequestException(
        'La inscripción debe ser un entero mayor que cero',
      );
    const i = await this.inscripciones.findById(id);
    if (!i) throw new NotFoundException('La inscripción no existe');
    const a = await this.verificarAsignacion(i.asignacion.id!, user);
    if (a.periodoAcademico.estado !== EstadoPeriodo.ACTIVO)
      throw new ForbiddenException('El período académico está finalizado');
    const { data: fechas } = await this.fechas.findAll(1, 100, [
      TipoProceso.FECHAS_NOTAS,
    ]);
    const hoy = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'America/Guayaquil',
    }).format(new Date());
    if (
      !fechas.some(
        (f) =>
          f.descripcion === descripcion[etapa] &&
          f.fechaInicio <= hoy &&
          hoy <= f.fechaFin,
      )
    )
      throw new ForbiddenException(
        'La etapa está fuera de las fechas habilitadas',
      );
    const lote = await this.notas.findByInscripcionIds([id]);
    const tipo = seleccionarPlantilla(i.matricula?.nivel, lote, id);
    const datos = {
      insumo1: dto.insumo1 ?? null,
      insumo2: dto.insumo2 ?? null,
      evaluacion: dto.evaluacion ?? null,
      mejoramiento: dto.mejoramiento ?? null,
      comportamiento: dto.comportamiento ?? null,
      notaExamen: dto.notaExamen ?? null,
    };
    const parcial = etapa.endsWith('P1') || etapa.endsWith('P2');
    if (parcial) {
      if (
        datos.insumo1 === null ||
        datos.insumo2 === null ||
        datos.evaluacion === null ||
        datos.notaExamen !== null
      )
        throw new BadRequestException(
          'El parcial requiere dos insumos y evaluación, sin nota de examen',
        );
      if (
        tipo === TipoPlantilla.GENERAL &&
        (datos.comportamiento === null || datos.mejoramiento !== null)
      )
        throw new BadRequestException(
          'La plantilla GENERAL requiere diez criterios de comportamiento y no permite mejoramiento',
        );
      if (
        tipo === TipoPlantilla.BASICO_ELEMENTAL &&
        datos.comportamiento !== null
      )
        throw new BadRequestException(
          'Básico Elemental no permite comportamiento',
        );
    } else {
      if (
        datos.notaExamen === null ||
        datos.insumo1 !== null ||
        datos.insumo2 !== null ||
        datos.evaluacion !== null ||
        datos.mejoramiento !== null ||
        datos.comportamiento !== null
      )
        throw new BadRequestException('Esta etapa solo admite nota de examen');
      if (etapa === EtapaCalificacion.FINAL) {
        if (tipo === TipoPlantilla.BASICO_ELEMENTAL)
          throw new BadRequestException(
            'La nota final BE se calcula; no tiene examen de recuperación',
          );
        const reporte = await this.reportes.getReporteByAsignaciones([a.id!]);
        const final = reporte.estudiantes.find(
          (e) => e.idInscripcion === id,
        )?.final;
        if (
          !final ||
          !('promedioAnual' in final) ||
          final.promedioAnual < 4 ||
          final.promedioAnual >= 7
        )
          throw new BadRequestException(
            'La recuperación requiere ambos quimestres completos y promedio anual entre 4 y menos de 7',
          );
      }
    }
    return this.notas.guardar(id, etapa, tipo, datos);
  }
}
