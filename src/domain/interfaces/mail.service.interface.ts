export const I_MAIL_SERVICE = 'IMailService';

export interface IMailService {
  enviarContrasenia(
    email: string,
    contrasenaProvisional: string,
  ): Promise<boolean>;
  enviarRecoverLink(email: string, link: string): Promise<boolean>;
}
