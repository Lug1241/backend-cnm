import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { type AuthenticatedRequest } from './jwt-auth.guard';

@Injectable()
export class RepresentanteGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (request.user?.type !== 'representante') {
      throw new ForbiddenException(
        'Solo un representante puede acceder a este recurso',
      );
    }

    return true;
  }
}
