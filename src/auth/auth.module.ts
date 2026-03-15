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
import {
  ADMIN_REPOSITORY,
  ADMIN_AUTH_REPOSITORY,
  ADMIN_PROFILE_REPOSITORY,
} from './domain/interfaces/admin.repository.interface.js';
import {
  CLIENT_REPOSITORY,
  CLIENT_AUTH_REPOSITORY,
  CLIENT_VERIFICATION_REPOSITORY,
  CLIENT_PROFILE_REPOSITORY,
} from './domain/interfaces/client.repository.interface.js';
import { HASH_SERVICE } from './domain/interfaces/hash.service.interface.js';
import { TOKEN_SERVICE } from './domain/interfaces/token.service.interface.js';
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
    { provide: HASH_SERVICE, useClass: BcryptHashService },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    { provide: CLIENT_REPOSITORY, useClass: PrismaClientRepository },
    { provide: CLIENT_AUTH_REPOSITORY, useExisting: CLIENT_REPOSITORY },
    { provide: CLIENT_VERIFICATION_REPOSITORY, useExisting: CLIENT_REPOSITORY },
    { provide: CLIENT_PROFILE_REPOSITORY, useExisting: CLIENT_REPOSITORY },
    { provide: ADMIN_REPOSITORY, useClass: PrismaAdminRepository },
    { provide: ADMIN_AUTH_REPOSITORY, useExisting: ADMIN_REPOSITORY },
    { provide: ADMIN_PROFILE_REPOSITORY, useExisting: ADMIN_REPOSITORY },
    ClientRegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    GetProfileUseCase,
    VerificationCodeCleanupCron,
  ],
  exports: [
    HASH_SERVICE,
    CLIENT_REPOSITORY,
    CLIENT_AUTH_REPOSITORY,
    CLIENT_VERIFICATION_REPOSITORY,
    CLIENT_PROFILE_REPOSITORY,
    ADMIN_AUTH_REPOSITORY,
    ADMIN_PROFILE_REPOSITORY,
  ],
})
export class AuthModule {}
