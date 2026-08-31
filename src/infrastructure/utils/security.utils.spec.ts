import { generarPasswordFuerte, ocultarDatosSensibles } from './security.utils';

describe('security.utils', () => {
  describe('generarPasswordFuerte', () => {
    it('debe generar una contraseña fuerte de ocho caracteres', () => {
      const password = generarPasswordFuerte();
      const especiales = '!@#$%^&*()_+-=';

      expect(password).toHaveLength(8);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[0-9]/);
      expect(
        [...password].some((caracter) => especiales.includes(caracter)),
      ).toBe(true);
    });
  });

  describe('ocultarDatosSensibles', () => {
    it('debe eliminar los campos sensibles sin modificar el original', () => {
      const usuario = {
        id: 1,
        nombre: 'Usuario de prueba',
        password: 'hash-secreto',
        resetToken: 'token-secreto',
        resetTokenExpires: new Date(),
      };

      const resultado = ocultarDatosSensibles(usuario);

      expect(resultado).toEqual({
        id: 1,
        nombre: 'Usuario de prueba',
      });

      expect(usuario.password).toBe('hash-secreto');
      expect(usuario.resetToken).toBe('token-secreto');
    });

    it('debe funcionar cuando los tokens opcionales no existen', () => {
      const usuario = {
        id: 2,
        nombre: 'Otro usuario',
        password: 'otro-hash',
      };

      const resultado = ocultarDatosSensibles(usuario);

      expect(resultado).toEqual({
        id: 2,
        nombre: 'Otro usuario',
      });
    });
  });
});
