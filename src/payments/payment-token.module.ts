import { Module } from '@nestjs/common';
import { PaymentTokenService } from './infrastructure/services/payment-token.service.js';

@Module({
  providers: [PaymentTokenService],
  exports: [PaymentTokenService],
})
export class PaymentTokenModule {}
