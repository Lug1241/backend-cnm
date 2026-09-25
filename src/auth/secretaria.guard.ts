import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { type AuthenticatedRequest } from './jwt-auth.guard';

@Injectable()
export class SecretariaGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (request.user?.type !== 'docente' || request.user.rol !== 'Secretaria') {
      throw new ForbiddenException(
        'Solo Secretaría puede acceder a este recurso',
      );
    }

    return true;
  }
}
