import { Module, forwardRef } from '@nestjs/common';
import { AppointmentsModule } from '../appointments/appointments.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { CardsModule } from '../cards/cards.module.js';
import { ReceiptsModule } from '../receipts/receipts.module.js';
import { ApprovePaymentUseCase } from './application/use-cases/payment/approve-payment.use-case.js';
import { CreateClientPaymentUseCase } from './application/use-cases/payment/create-client-payment.use-case.js';
import { DeletePaymentUseCase } from './application/use-cases/payment/delete-payment.use-case.js';
import { GetClientPaymentUseCase } from './application/use-cases/payment/get-client-payment.use-case.js';
import { GetPaymentUseCase } from './application/use-cases/payment/get-payment.use-case.js';
import { ListClientPaymentsUseCase } from './application/use-cases/payment/list-client-payments.use-case.js';
import { ListPaymentsUseCase } from './application/use-cases/payment/list-payments.use-case.js';
import { PAYMENT_REPOSITORY } from './domain/interfaces/payment.repository.interface.js';
import { PrismaPaymentRepository } from './infrastructure/repositories/prisma-payment.repository.js';
import { AdminPaymentsController } from './admin-payments.controller.js';
import { ClientPaymentsController } from './client-payments.controller.js';

@Module({
  imports: [AppointmentsModule, AuthModule, CardsModule, forwardRef(() => ReceiptsModule)],
  controllers: [AdminPaymentsController, ClientPaymentsController],
  providers: [
    { provide: PAYMENT_REPOSITORY, useClass: PrismaPaymentRepository },
    ListPaymentsUseCase,
    GetPaymentUseCase,
    ApprovePaymentUseCase,
    DeletePaymentUseCase,
    CreateClientPaymentUseCase,
    ListClientPaymentsUseCase,
    GetClientPaymentUseCase,
  ],
  exports: [PAYMENT_REPOSITORY],
})
export class PaymentsModule {}
