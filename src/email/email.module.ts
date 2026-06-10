import { DiTokens } from '../shared/di/di-tokens.js';
import { Global, Module } from '@nestjs/common';
import { ResendEmailService } from './infrastructure/services/resend-email.service.js';

@Global()
@Module({
  providers: [
    {
      provide: DiTokens.emailService,
      useClass: ResendEmailService,
    },
  ],
  exports: [DiTokens.emailService],
})
export class EmailModule {}
