import { DiTokens } from '../shared/di/di-tokens.js';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../shared/prisma/prisma.module.js';
import { CheckReadinessUseCase } from './application/use-cases/health/check-readiness.use-case.js';
import { HealthController } from './health.controller.js';
import { PrismaHealthRepository } from './infrastructure/repositories/prisma-health.repository.js';

@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
  providers: [
    CheckReadinessUseCase,
    { provide: DiTokens.healthRepository, useClass: PrismaHealthRepository },
  ],
})
export class HealthModule {}
