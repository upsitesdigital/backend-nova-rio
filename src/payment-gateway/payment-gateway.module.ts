import { DiTokens } from '../shared/di/di-tokens.js';
import { Global, Module } from '@nestjs/common';
import { AppointmentsModule } from '../appointments/appointments.module.js';
import { PaymentsModule } from '../payments/payments.module.js';
import { ReceiptsModule } from '../receipts/receipts.module.js';
import { PrismaModule } from '../shared/prisma/prisma.module.js';
import { HandleVindiBillPaidUseCase } from './application/use-cases/webhook/handle-vindi-bill-paid.use-case.js';
import { HandleVindiChargeRejectedUseCase } from './application/use-cases/webhook/handle-vindi-charge-rejected.use-case.js';
import { ProcessVindiWebhookUseCase } from './application/use-cases/webhook/process-vindi-webhook.use-case.js';
import { VindiHttpClient } from './infrastructure/clients/vindi-http.client.js';
import { PrismaProcessedWebhookEventRepository } from './infrastructure/repositories/prisma-processed-webhook-event.repository.js';
import { VindiPaymentGatewayService } from './infrastructure/services/vindi-payment-gateway.service.js';
import { VindiBasicAuthenticator } from './infrastructure/services/vindi-basic-authenticator.service.js';
import { VindiWebhooksController } from './vindi-webhooks.controller.js';

@Global()
@Module({
  imports: [AppointmentsModule, PaymentsModule, ReceiptsModule, PrismaModule],
  controllers: [VindiWebhooksController],
  providers: [
    VindiHttpClient,
    {
      provide: DiTokens.paymentGatewayService,
      useClass: VindiPaymentGatewayService,
    },
    {
      provide: DiTokens.webhookAuthenticator,
      useClass: VindiBasicAuthenticator,
    },
    {
      provide: DiTokens.processedWebhookEventRepository,
      useClass: PrismaProcessedWebhookEventRepository,
    },
    HandleVindiBillPaidUseCase,
    HandleVindiChargeRejectedUseCase,
    ProcessVindiWebhookUseCase,
  ],
  exports: [DiTokens.paymentGatewayService],
})
export class PaymentGatewayModule {}
