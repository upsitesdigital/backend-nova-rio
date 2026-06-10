import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type { IJobLock } from '../../domain/interfaces/job-lock.interface.js';

@Injectable()
export class JobLockService implements IJobLock {
  constructor(private prisma: PrismaService) {}

  async acquire(name: string, ttlMinutes: number): Promise<boolean> {
    const acquired = await this.prisma.$queryRaw<Array<{ name: string }>>`
      INSERT INTO job_locks ("name", "lockedUntil")
      VALUES (${name}, NOW() + (${ttlMinutes} * INTERVAL '1 minute'))
      ON CONFLICT ("name") DO UPDATE
      SET "lockedUntil" = EXCLUDED."lockedUntil"
      WHERE job_locks."lockedUntil" <= NOW()
      RETURNING "name"
    `;

    return acquired.length === 1;
  }

  async release(name: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE job_locks
      SET "lockedUntil" = NOW()
      WHERE "name" = ${name}
    `;
  }
}
