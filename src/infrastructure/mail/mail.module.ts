import { Module, Global } from '@nestjs/common';
import { NodemailerService } from './nodemailer.service';
import { I_MAIL_SERVICE } from '@domain/interfaces/mail.service.interface';

@Global()
@Module({
  providers: [
    {
      provide: I_MAIL_SERVICE,
      useClass: NodemailerService,
    },
  ],
  exports: [I_MAIL_SERVICE],
})
export class MailModule {}
