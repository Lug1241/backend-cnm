import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { type IMailService } from '@domain/interfaces/mail.service.interface';

@Injectable()
export class NodemailerService implements IMailService {
  private readonly logger = new Logger(NodemailerService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
    void this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('Conexión SMTP con Gmail establecida correctamente ✅');
    } catch (err) {
      this.logger.error('❌ Error al conectar con Gmail:', err);
    }
  }

  async enviarContrasenia(
    email: string,
    contrasenaProvisional: string,
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get<string>('EMAIL'),
        to: email,
        subject: 'Contraseña provisional',
        text: `Hola, tu cuenta ha sido creada. \nTu contraseña provisional es: ${contrasenaProvisional}.\n\nPor favor, cámbiala lo antes posible.`,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Error al enviar correo de contraseña provisional: ${mensaje}`,
      );
    }
  }

  async enviarRecoverLink(email: string, link: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get<string>('EMAIL'),
        to: email,
        subject: 'Recuperar contraseña',
        text: `Hola, para recuperar tu contraseña haz click en el siguiente enlace: ${link}.\n\nEste link tiene una expiración de 15 minutos.`,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      throw new Error(`Error al enviar correo de recuperación: ${mensaje}`);
    }
  }
}
