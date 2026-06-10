import { DiTokens } from '../shared/di/di-tokens.js';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LoginUseCase } from './application/use-cases/auth/login.use-case.js';
import { ClientRegisterUseCase } from './application/use-cases/client/client-register.use-case.js';
import { ForgotPasswordUseCase } from './application/use-cases/client/forgot-password.use-case.js';
import { ResetPasswordUseCase } from './application/use-cases/client/reset-password.use-case.js';
import { GetProfileUseCase } from './application/use-cases/auth/get-profile.use-case.js';
import { RefreshTokenUseCase } from './application/use-cases/auth/refresh-token.use-case.js';
import { AuthController } from './auth.controller.js';
import { PrismaAdminRepository } from './infrastructure/repositories/prisma-admin.repository.js';
import { PrismaClientRepository } from './infrastructure/repositories/prisma-client.repository.js';
import { BcryptHashService } from './infrastructure/services/bcrypt-hash.service.js';
import { JwtTokenService } from './infrastructure/services/jwt-token.service.js';
import { VerificationCodeCleanupCron } from './infrastructure/services/verification-code-cleanup.cron.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    { provide: DiTokens.hashService, useClass: BcryptHashService },
    { provide: DiTokens.tokenService, useClass: JwtTokenService },
    { provide: DiTokens.clientRepository, useClass: PrismaClientRepository },
    { provide: DiTokens.clientAuthRepository, useExisting: DiTokens.clientRepository },
    { provide: DiTokens.clientVerificationRepository, useExisting: DiTokens.clientRepository },
    { provide: DiTokens.clientProfileRepository, useExisting: DiTokens.clientRepository },
    { provide: DiTokens.adminRepository, useClass: PrismaAdminRepository },
    { provide: DiTokens.adminAuthRepository, useExisting: DiTokens.adminRepository },
    { provide: DiTokens.adminProfileRepository, useExisting: DiTokens.adminRepository },
    ClientRegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    GetProfileUseCase,
    VerificationCodeCleanupCron,
  ],
  exports: [
    DiTokens.hashService,
    DiTokens.clientRepository,
    DiTokens.clientAuthRepository,
    DiTokens.clientVerificationRepository,
    DiTokens.clientProfileRepository,
    DiTokens.adminAuthRepository,
    DiTokens.adminProfileRepository,
  ],
})
export class AuthModule {}
