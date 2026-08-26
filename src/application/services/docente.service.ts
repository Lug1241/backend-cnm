import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { hash, genSalt } from 'bcryptjs';
import {
  type IDocenteRepository,
  I_DOCENTE_REPOSITORY,
} from '@domain/interfaces/docente.repository.interface';
import { Docente } from '@domain/entities/docente.entity';
import { CreateDocenteDto } from '../dtos/create-docente.dto';
import { UpdateDocenteDto } from '../dtos/update-docente.dto';
import {
  type IMailService,
  I_MAIL_SERVICE,
} from '@domain/interfaces/mail.service.interface';

@Injectable()
export class DocenteService {
  constructor(
    @Inject(I_DOCENTE_REPOSITORY)
    private readonly docenteRepository: IDocenteRepository,
    @Inject(I_MAIL_SERVICE)
    private readonly mailService: IMailService,
  ) {}

  private generarPasswordFuerte(): string {
    const mayus = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const minus = 'abcdefghijklmnopqrstuvwxyz';
    const num = '0123456789';
    const esp = '!@#$%^&*()_+~|}{[]:;?><,./-=';
    const todos = mayus + minus + num + esp;

    let password = '';
    password += mayus[Math.floor(Math.random() * mayus.length)];
    password += minus[Math.floor(Math.random() * minus.length)];
    password += num[Math.floor(Math.random() * num.length)];
    password += esp[Math.floor(Math.random() * esp.length)];

    for (let i = 4; i < 8; i++) {
      password += todos[Math.floor(Math.random() * todos.length)];
    }

    return password
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  }

  async create(dto: CreateDocenteDto) {
    const docenteExistente = await this.docenteRepository.findByCedula(
      dto.nroCedula,
    );
    if (docenteExistente) {
      throw new ConflictException('La cédula ya existe');
    }

    const emailExistente = await this.docenteRepository.findByEmail(dto.email);
    if (emailExistente) {
      throw new ConflictException('El email ya está registrado');
    }

    const provicional = this.generarPasswordFuerte();
    const salt = await genSalt(10);
    const hashedPassword = await hash(provicional, salt);

    const nuevoDocente = new Docente({
      ...dto,
      password: hashedPassword,
      debeCambiarPassword: true,
      habilitado: false,
    });

    const guardado = await this.docenteRepository.create(nuevoDocente);
    await this.mailService.enviarContrasenia(dto.email, provicional);
    const {
      password: _password,
      resetToken: _resetToken,
      resetTokenExpires: _resetTokenExpires,
      ...result
    } = guardado;
    return result;
  }

  async update(nroCedula: string, dto: UpdateDocenteDto) {
    const docenteActual = await this.docenteRepository.findByCedula(nroCedula);
    if (!docenteActual) {
      throw new NotFoundException('Docente no encontrado');
    }

    const datosAActualizar: Partial<Docente> = { ...dto };

    if (dto.password) {
      const salt = await genSalt(10);
      datosAActualizar.password = await hash(dto.password, salt);
    }

    if (dto.email && dto.email !== docenteActual.email) {
      const emailEnUso = await this.docenteRepository.findByEmail(dto.email);
      if (emailEnUso) {
        throw new ConflictException(
          'El nuevo email ya está registrado por otro docente',
        );
      }

      const provicional = this.generarPasswordFuerte();
      const salt = await genSalt(10);
      datosAActualizar.password = await hash(provicional, salt);

      // 👇 Aquí envías el correo a la nueva dirección
      // await enviarContrasenia(dto.email, provicional);
    }

    await this.docenteRepository.update(nroCedula, datosAActualizar);

    const actualizado = await this.docenteRepository.findByCedula(nroCedula);
    const {
      password: _password,
      resetToken: _resetToken,
      resetTokenExpires: _resetTokenExpires,
      ...result
    } = actualizado!;
    return result;
  }

  async getByCedula(nroCedula: string) {
    const docente = await this.docenteRepository.findByCedula(nroCedula);
    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }
    const {
      password: _password,
      resetToken: _resetToken,
      resetTokenExpires: _resetTokenExpires,
      ...result
    } = docente;
    return result;
  }

  async getAll(page: number, limit: number, search: string) {
    const { data, totalRows } = await this.docenteRepository.findAll(
      page,
      limit,
      search,
    );

    const docentesLimpios = data.map((docente) => {
      const {
        password: _password,
        resetToken: _resetToken,
        resetTokenExpires: _resetTokenExpires,
        ...resto
      } = docente;
      return resto;
    });

    return {
      data: docentesLimpios,
      totalPages: Math.ceil(totalRows / limit),
      currentPage: page,
      totalRows,
    };
  }

  async delete(nroCedula: string) {
    const docente = await this.docenteRepository.findByCedula(nroCedula);
    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }
    await this.docenteRepository.delete(nroCedula);

    const {
      password: _password,
      resetToken: _resetToken,
      resetTokenExpires: _resetTokenExpires,
      ...result
    } = docente;
    return result;
  }
}
