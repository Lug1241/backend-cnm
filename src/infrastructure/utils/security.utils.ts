import { randomInt } from 'crypto';

const MAYUSCULAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const MINUSCULAS = 'abcdefghijklmnopqrstuvwxyz';
const NUMEROS = '0123456789';
const ESPECIALES = '!@#$%^&*()_+-=';

function obtenerCaracter(caracteres: string): string {
  return caracteres[randomInt(caracteres.length)];
}

export function generarPasswordFuerte(): string {
  const todos = MAYUSCULAS + MINUSCULAS + NUMEROS + ESPECIALES;
  const password = [
    obtenerCaracter(MAYUSCULAS),
    obtenerCaracter(MINUSCULAS),
    obtenerCaracter(NUMEROS),
    obtenerCaracter(ESPECIALES),
  ];
  while (password.length < 8) {
    password.push(obtenerCaracter(todos));
  }
  for (let i = password.length - 1; i > 0; i--) {
    const posicion = randomInt(i + 1);
    [password[i], password[posicion]] = [password[posicion], password[i]];
  }
  return password.join('');
}

type UsuarioConDatosSensibles = {
  password: unknown;
  resetToken?: unknown;
  resetTokenExpires?: unknown;
};

export function ocultarDatosSensibles<T extends UsuarioConDatosSensibles>(
  usuario: T,
): Omit<T, keyof UsuarioConDatosSensibles> {
  const {
    password: _password,
    resetToken: _resetToken,
    resetTokenExpires: _resetTokenExpires,
    ...resultado
  } = usuario;

  return resultado;
}
