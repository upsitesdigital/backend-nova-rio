import { DiTokens } from '../shared/di/di-tokens.js';
import { Module } from '@nestjs/common';
import { AppointmentsModule } from '../appointments/appointments.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { CardsModule } from '../cards/cards.module.js';
import { PaymentsModule } from '../payments/payments.module.js';
import { AdminNotificationCoreModule } from '../admin-notifications/admin-notifications-core.module.js';
import { ClientProfileController } from './client-profile.controller.js';
import { DeleteClientAccountUseCase } from './application/use-cases/profile/delete-client-account.use-case.js';
import { GetClientProfileUseCase } from './application/use-cases/profile/get-client-profile.use-case.js';
import { RequestEmailChangeUseCase } from './application/use-cases/profile/request-email-change.use-case.js';
import { RequestPasswordChangeUseCase } from './application/use-cases/profile/request-password-change.use-case.js';
import { UpdateClientProfileUseCase } from './application/use-cases/profile/update-client-profile.use-case.js';
import { VerifyEmailChangeUseCase } from './application/use-cases/profile/verify-email-change.use-case.js';
import { VerifyPasswordChangeUseCase } from './application/use-cases/profile/verify-password-change.use-case.js';
import { PrismaClientProfileRepository } from './infrastructure/repositories/prisma-client-profile.repository.js';

@Module({
  imports: [
    AppointmentsModule,
    AuthModule,
    CardsModule,
    PaymentsModule,
    AdminNotificationCoreModule,
  ],
  controllers: [ClientProfileController],
  providers: [
    { provide: DiTokens.profileRepository, useClass: PrismaClientProfileRepository },
    GetClientProfileUseCase,
    UpdateClientProfileUseCase,
    RequestEmailChangeUseCase,
    VerifyEmailChangeUseCase,
    RequestPasswordChangeUseCase,
    VerifyPasswordChangeUseCase,
    DeleteClientAccountUseCase,
  ],
})
export class ClientProfileModule {}
