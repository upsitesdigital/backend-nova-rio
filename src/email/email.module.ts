import { Global, Module } from '@nestjs/common';
import { EMAIL_SERVICE } from './domain/interfaces/email.service.interface.js';
import { ResendEmailService } from './infrastructure/services/resend-email.service.js';

@Global()
@Module({
  providers: [
    {
      provide: EMAIL_SERVICE,
      useClass: ResendEmailService,
    },
  ],
  exports: [EMAIL_SERVICE],
})
export class EmailModule {}
