import { DiTokens } from '../shared/di/di-tokens.js';
import { Module, forwardRef } from '@nestjs/common';
import { AppointmentsModule } from '../appointments/appointments.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { CardsModule } from '../cards/cards.module.js';
import { ReceiptsModule } from '../receipts/receipts.module.js';
import { AdminNotificationCoreModule } from '../admin-notifications/admin-notifications-core.module.js';
import { ApprovePaymentUseCase } from './application/use-cases/payment/approve-payment.use-case.js';
import { CancelPaymentUseCase } from './application/use-cases/payment/cancel-payment.use-case.js';
import { CreateClientPaymentUseCase } from './application/use-cases/payment/create-client-payment.use-case.js';
import { CreatePublicCheckoutUseCase } from './application/use-cases/payment/create-public-checkout.use-case.js';
import { GetClientPaymentUseCase } from './application/use-cases/payment/get-client-payment.use-case.js';
import { GetPaymentUseCase } from './application/use-cases/payment/get-payment.use-case.js';
import { ListClientPaymentsUseCase } from './application/use-cases/payment/list-client-payments.use-case.js';
import { ListPaymentsUseCase } from './application/use-cases/payment/list-payments.use-case.js';
import { PrismaPaymentPricingService } from './infrastructure/services/prisma-payment-pricing.service.js';
import { PrismaPaymentRepository } from './infrastructure/repositories/prisma-payment.repository.js';
import { AdminPaymentsController } from './admin-payments.controller.js';
import { ClientPaymentsController } from './client-payments.controller.js';

@Module({
  imports: [
    AppointmentsModule,
    AuthModule,
    CardsModule,
    forwardRef(() => ReceiptsModule),
    AdminNotificationCoreModule,
  ],
  controllers: [AdminPaymentsController, ClientPaymentsController],
  providers: [
    { provide: DiTokens.paymentRepository, useClass: PrismaPaymentRepository },
    { provide: DiTokens.paymentPricingService, useClass: PrismaPaymentPricingService },
    ListPaymentsUseCase,
    GetPaymentUseCase,
    ApprovePaymentUseCase,
    CancelPaymentUseCase,
    CreateClientPaymentUseCase,
    CreatePublicCheckoutUseCase,
    ListClientPaymentsUseCase,
    GetClientPaymentUseCase,
  ],
  exports: [DiTokens.paymentRepository],
})
export class PaymentsModule {}
