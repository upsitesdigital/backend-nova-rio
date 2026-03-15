import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { ClientGuard } from '../auth/guards/client.guard.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthUser } from '../shared/types/auth-user.type.js';
import { GetClientDashboardSummaryUseCase } from './application/use-cases/client-dashboard/get-client-dashboard-summary.use-case.js';

@ApiTags('Client Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ClientGuard)
@Controller('client/dashboard')
export class ClientDashboardController {
  constructor(private getClientDashboardSummaryUseCase: GetClientDashboardSummaryUseCase) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get client dashboard summary' })
  @ApiOkResponse({ description: 'Returns client dashboard summary data' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({ description: 'Only clients can access this resource' })
  getClientDashboardSummary(@CurrentUser() user: AuthUser) {
    return this.getClientDashboardSummaryUseCase.getClientDashboardSummary(user.id);
  }
}
