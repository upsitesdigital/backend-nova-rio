import { DiTokens } from '../shared/di/di-tokens.js';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { AdminProfileController } from './admin-profile.controller.js';
import { GetAdminProfileUseCase } from './application/use-cases/profile/get-admin-profile.use-case.js';
import { RequestAdminEmailChangeUseCase } from './application/use-cases/profile/request-admin-email-change.use-case.js';
import { RequestAdminPasswordChangeUseCase } from './application/use-cases/profile/request-admin-password-change.use-case.js';
import { UpdateAdminProfileUseCase } from './application/use-cases/profile/update-admin-profile.use-case.js';
import { VerifyAdminEmailChangeUseCase } from './application/use-cases/profile/verify-admin-email-change.use-case.js';
import { VerifyAdminPasswordChangeUseCase } from './application/use-cases/profile/verify-admin-password-change.use-case.js';
import { PrismaAdminProfileRepository } from './infrastructure/repositories/prisma-admin-profile.repository.js';

@Module({
  imports: [AuthModule],
  controllers: [AdminProfileController],
  providers: [
    { provide: DiTokens.adminProfileSelfRepository, useClass: PrismaAdminProfileRepository },
    GetAdminProfileUseCase,
    UpdateAdminProfileUseCase,
    RequestAdminEmailChangeUseCase,
    VerifyAdminEmailChangeUseCase,
    RequestAdminPasswordChangeUseCase,
    VerifyAdminPasswordChangeUseCase,
  ],
})
export class AdminProfileModule {}
