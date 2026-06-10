import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type { IHealthRepository } from '../../domain/interfaces/health.repository.interface.js';

@Injectable()
export class PrismaHealthRepository implements IHealthRepository {
  constructor(private prisma: PrismaService) {}

  async pingDatabase(): Promise<void> {
    await this.prisma.$queryRaw`SELECT 1`;
  }
}
