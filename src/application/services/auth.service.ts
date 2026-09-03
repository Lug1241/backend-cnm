import {
  Injectable,
  Inject,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import {
  I_DOCENTE_REPOSITORY,
  type IDocenteRepository,
} from '@domain/interfaces/docente.repository.interface';
import {
  I_REPRESENTANTE_REPOSITORY,
  type IRepresentanteRepository,
} from '@domain/interfaces/representante.repository.interface';
import { Docente } from '@domain/entities/docente.entity';
import { Representante } from '@domain/entities/representante.entity';
import { LoginDto } from '../dtos/auth/login.dto';
import { ocultarDatosSensibles } from '@infrastructure/utils/security.utils';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(I_DOCENTE_REPOSITORY)
    private readonly docenteRepository: IDocenteRepository,

    @Inject(I_REPRESENTANTE_REPOSITORY)
    private readonly representanteRepository: IRepresentanteRepository,

    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const { nroCedula, password, type } = dto;

    this.logger.log(
      `Intento de login iniciado. Cédula: ${nroCedula} | Tipo solicitado: ${type}`,
    );

    let user: Docente | Representante | null = null;
    let rol: string | null = null;
    let subRol: string | null = null;

    if (type === 'representante') {
      const representante =
        await this.representanteRepository.findByCedula(nroCedula);
      if (representante) {
        user = representante;
        rol = 'representante';
      }
    } else if (type === 'docente') {
      const docente = await this.docenteRepository.findByCedula(nroCedula);
      if (docente) {
        user = docente;
        rol = 'docente';
        subRol = docente.rol;
      }
    }

    if (!user) {
      this.logger.warn(
        `Fallo de login - Cédula no encontrada para el rol ${type}: ${nroCedula}`,
      );
      throw new NotFoundException('Credenciales o tipo de usuario incorrectos');
    }

    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await compare(password, user.password);
    } else {
      isMatch = password === user.password;
    }

    if (!isMatch) {
      this.logger.warn(
        `Fallo de login - Contraseña incorrecta para la cédula: ${nroCedula}`,
      );
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    this.logger.log(
      `Login exitoso - Cédula: ${nroCedula} | Rol: ${rol}${subRol ? ` | SubRol: ${subRol}` : ''}`,
    );

    const payload = { id: user.nroCedula, rol, type, subRol };
    const token = this.jwtService.sign(payload);

    const usuarioSeguro = ocultarDatosSensibles(user);

    return {
      ...usuarioSeguro,
      rol,
      subRol,
      type,
      token,
    };
  }
}
