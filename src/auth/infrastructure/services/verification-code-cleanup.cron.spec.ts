import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { VerificationCodeCleanupCron } from './verification-code-cleanup.cron.js';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';

describe('VerificationCodeCleanupCron', () => {
  let cron: VerificationCodeCleanupCron;
  let prisma: { verificationCode: { deleteMany: ReturnType<typeof vi.fn> } };

  beforeEach(async () => {
    prisma = { verificationCode: { deleteMany: vi.fn().mockResolvedValue({ count: 5 }) } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [VerificationCodeCleanupCron, { provide: PrismaService, useValue: prisma }],
    }).compile();

    cron = module.get<VerificationCodeCleanupCron>(VerificationCodeCleanupCron);
  });

  it('should be defined', () => {
    expect(cron).toBeDefined();
  });

  it('should delete expired verification codes', async () => {
    await cron.cleanupExpiredCodes();

    expect(prisma.verificationCode.deleteMany).toHaveBeenCalledWith({
      where: { expiresAt: { lt: expect.any(Date) as Date } },
    });
  });

  it('should not throw if deleteMany resolves', async () => {
    await expect(cron.cleanupExpiredCodes()).resolves.toBeUndefined();
  });
});
