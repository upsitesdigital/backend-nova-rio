import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { CheckReadinessUseCase } from './application/use-cases/health/check-readiness.use-case.js';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly checkReadinessUseCase: CheckReadinessUseCase) {}

  @Get('live')
  @SkipThrottle()
  @ApiOperation({ summary: 'Liveness check' })
  @ApiOkResponse({ description: 'Service is alive' })
  checkLiveness() {
    return { status: 'ok' };
  }

  @Get('ready')
  @SkipThrottle()
  @ApiOperation({ summary: 'Readiness check (includes DB)' })
  @ApiOkResponse({ description: 'Service is ready and database is reachable' })
  async checkReadiness() {
    await this.checkReadinessUseCase.checkReadiness();
    return { status: 'ok' };
  }
}
