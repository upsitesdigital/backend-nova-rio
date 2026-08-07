import { DiTokens } from '../shared/di/di-tokens.js';
import { Global, Module } from '@nestjs/common';
import { Smtp2goEmailService } from './infrastructure/services/smtp2go-email.service.js';

@Global()
@Module({
  providers: [
    {
      provide: DiTokens.emailService,
      useClass: Smtp2goEmailService,
    },
  ],
  exports: [DiTokens.emailService],
})
export class EmailModule {}
