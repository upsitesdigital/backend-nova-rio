import { Global, Module } from '@nestjs/common';
import { PaymentsModule } from '../payments/payments.module.js';
import { ReceiptsModule } from '../receipts/receipts.module.js';
import { PrismaModule } from '../shared/prisma/prisma.module.js';
import { HandleVindiBillPaidUseCase } from './application/use-cases/webhook/handle-vindi-bill-paid.use-case.js';
import { HandleVindiChargeRejectedUseCase } from './application/use-cases/webhook/handle-vindi-charge-rejected.use-case.js';
import { PAYMENT_GATEWAY_SERVICE } from './domain/interfaces/payment-gateway.service.interface.js';
import { VindiHttpClient } from './infrastructure/clients/vindi-http.client.js';
import { VindiPaymentGatewayService } from './infrastructure/services/vindi-payment-gateway.service.js';
import { VindiWebhooksController } from './vindi-webhooks.controller.js';

@Global()
@Module({
  imports: [PaymentsModule, ReceiptsModule, PrismaModule],
  controllers: [VindiWebhooksController],
  providers: [
    VindiHttpClient,
    {
      provide: PAYMENT_GATEWAY_SERVICE,
      useClass: VindiPaymentGatewayService,
    },
    HandleVindiBillPaidUseCase,
    HandleVindiChargeRejectedUseCase,
  ],
  exports: [PAYMENT_GATEWAY_SERVICE],
})
export class PaymentGatewayModule {}
