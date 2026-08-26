import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  DescripcionSolicitud,
  EstadoSolicitud,
  Solicitud,
} from '../../domain/entities/solicitud.entity';
import type { ISolicitudRepository } from '../../domain/interfaces/solicitud.repository.interface';
import { CreateSolicitudDto } from '../dtos/create-solicitud.dto';
import { SolicitudService } from './solicitud.service';

describe('SolicitudService', () => {
  let service: SolicitudService;
  let repository: jest.Mocked<ISolicitudRepository>;

  const createDto: CreateSolicitudDto = {
    nroCedulaDocente: '0102030405',
    descripcion: DescripcionSolicitud.PARCIAL1_QUIM1,
    motivo: 'Calificaciones pendientes',
    fechaSolicitud: new Date('2026-08-25'),
    fechaInicio: new Date('2026-08-20'),
    fechaFin: new Date('2026-08-24'),
  };

  const solicitud = new Solicitud({
    id: 1,
    ...createDto,
    fechaInicio: createDto.fechaInicio ?? null,
    fechaFin: createDto.fechaFin ?? null,
    estado: EstadoSolicitud.PENDIENTE,
  });

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findDuplicate: jest.fn(),
      findByDocente: jest.fn(),
      findAll: jest.fn(),
      findLastAcceptedByDocente: jest.fn(),
      delete: jest.fn(),
    };
    service = new SolicitudService(repository);
  });

  it('crea una solicitud con estado Pendiente', async () => {
    repository.findDuplicate.mockResolvedValue(null);
    repository.create.mockImplementation((entity) => Promise.resolve(entity));

    const result = await service.create(createDto);

    expect(repository.findDuplicate.mock.calls).toEqual([
      [
        {
          nroCedulaDocente: createDto.nroCedulaDocente,
          fechaInicio: createDto.fechaInicio,
          fechaFin: createDto.fechaFin,
          motivo: createDto.motivo,
          descripcion: createDto.descripcion,
        },
      ],
    ]);
    expect(repository.create.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ estado: EstadoSolicitud.PENDIENTE }),
    );
    expect(result.estado).toBe(EstadoSolicitud.PENDIENTE);
  });

  it('rechaza una solicitud duplicada', async () => {
    repository.findDuplicate.mockResolvedValue(solicitud);

    await expect(service.create(createDto)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(repository.create.mock.calls).toHaveLength(0);
  });

  it('rechaza un rango de fechas inválido', async () => {
    const dto = {
      ...createDto,
      fechaInicio: new Date('2026-08-25'),
      fechaFin: new Date('2026-08-24'),
    };

    await expect(service.create(dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.findDuplicate.mock.calls).toHaveLength(0);
    expect(repository.create.mock.calls).toHaveLength(0);
  });

  it('combina las fechas existentes y nuevas en una actualización parcial', async () => {
    const actual = new Solicitud({
      ...solicitud,
      fechaInicio: new Date('2026-08-20'),
      fechaFin: new Date('2026-08-30'),
    });
    const actualizada = new Solicitud({
      ...actual,
      fechaInicio: new Date('2026-08-29'),
    });
    repository.findById
      .mockResolvedValueOnce(actual)
      .mockResolvedValueOnce(actualizada);
    repository.update.mockResolvedValue(true);

    const result = await service.update(1, {
      fechaInicio: new Date('2026-08-29'),
    });

    expect(repository.update.mock.calls).toEqual([
      [1, { fechaInicio: new Date('2026-08-29') }],
    ]);
    expect(result).toBe(actualizada);
  });

  it('rechaza una actualización parcial cuyo rango combinado es inválido', async () => {
    repository.findById.mockResolvedValue(solicitud);

    await expect(
      service.update(1, { fechaInicio: new Date('2026-08-25') }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.update.mock.calls).toHaveLength(0);
  });

  it('lanza error al actualizar una solicitud inexistente', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      service.update(999, { motivo: 'Nuevo motivo' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.update.mock.calls).toHaveLength(0);
  });

  it('lanza error cuando no existe una última solicitud aceptada', async () => {
    repository.findLastAcceptedByDocente.mockResolvedValue(null);

    await expect(
      service.getLastAcceptedByDocente('0102030405'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('elimina una solicitud después de comprobar su existencia', async () => {
    repository.findById.mockResolvedValue(solicitud);
    repository.delete.mockResolvedValue(undefined);

    const result = await service.delete(1);

    expect(repository.findById.mock.calls).toEqual([[1]]);
    expect(repository.delete.mock.calls).toEqual([[1]]);
    expect(repository.findById.mock.invocationCallOrder[0]).toBeLessThan(
      repository.delete.mock.invocationCallOrder[0],
    );
    expect(result).toBe(solicitud);
  });
});
