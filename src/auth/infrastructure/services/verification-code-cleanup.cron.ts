import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';

@Injectable()
export class VerificationCodeCleanupCron {
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredCodes() {
    await this.prisma.verificationCode.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}
