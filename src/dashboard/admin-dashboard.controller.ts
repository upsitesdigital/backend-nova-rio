import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { GetActiveClientsCountUseCase } from './application/use-cases/dashboard/get-active-clients-count.use-case.js';
import { GetPendingAppointmentsCountUseCase } from './application/use-cases/dashboard/get-pending-appointments-count.use-case.js';
import { GetTodayAgendaUseCase } from './application/use-cases/dashboard/get-today-agenda.use-case.js';
import { GetTodayAppointmentsCountUseCase } from './application/use-cases/dashboard/get-today-appointments-count.use-case.js';
import { DashboardFiltersQueryDto } from './dto/dashboard/dashboard-filters-query.dto.js';
import { TodayAgendaQueryDto } from './dto/dashboard/today-agenda-query.dto.js';

@ApiTags('Admin Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_MASTER', 'ADMIN_BASIC')
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(
    private getTodayAppointmentsCountUseCase: GetTodayAppointmentsCountUseCase,
    private getActiveClientsCountUseCase: GetActiveClientsCountUseCase,
    private getPendingAppointmentsCountUseCase: GetPendingAppointmentsCountUseCase,
    private getTodayAgendaUseCase: GetTodayAgendaUseCase,
  ) {}

  @Get('today-appointments-count')
  @ApiOperation({ summary: "Get today's scheduled appointments count" })
  @ApiOkResponse({ description: 'Returns count of appointments scheduled for today' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getTodayAppointmentsCount(@Query() query: DashboardFiltersQueryDto) {
    return this.getTodayAppointmentsCountUseCase.getTodayAppointmentsCount(query);
  }

  @Get('active-clients-count')
  @ApiOperation({ summary: 'Get active clients count' })
  @ApiOkResponse({ description: 'Returns count of active clients' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getActiveClientsCount(@Query() query: DashboardFiltersQueryDto) {
    return this.getActiveClientsCountUseCase.getActiveClientsCount(query);
  }

  @Get('pending-appointments-count')
  @ApiOperation({ summary: 'Get pending appointments count' })
  @ApiOkResponse({ description: 'Returns count of pending (scheduled) appointments' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getPendingAppointmentsCount(@Query() query: DashboardFiltersQueryDto) {
    return this.getPendingAppointmentsCountUseCase.getPendingAppointmentsCount(query);
  }

  @Get('today-agenda')
  @ApiOperation({ summary: "Get today's agenda with pagination and service filter" })
  @ApiOkResponse({ description: "Returns paginated list of today's appointments" })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getTodayAgenda(@Query() query: TodayAgendaQueryDto) {
    return this.getTodayAgendaUseCase.getTodayAgenda(query);
  }
}
