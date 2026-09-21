export type AuthUserType = 'docente' | 'representante';

export interface AuthPayload {
  id: string;
  rol: string;
  type: AuthUserType;
  iat?: number;
  exp?: number;
}
