import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../shared/prisma/prisma.service.js';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('live')
  @SkipThrottle()
  @ApiOperation({ summary: 'Liveness check' })
  checkLiveness() {
    return { status: 'ok' };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check (includes DB)' })
  async checkReadiness() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok' };
  }
}
