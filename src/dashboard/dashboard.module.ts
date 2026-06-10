import { DiTokens } from '../shared/di/di-tokens.js';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { AdminDashboardController } from './admin-dashboard.controller.js';
import { GetActiveClientsCountUseCase } from './application/use-cases/dashboard/get-active-clients-count.use-case.js';
import { GetPendingAppointmentsCountUseCase } from './application/use-cases/dashboard/get-pending-appointments-count.use-case.js';
import { GetTodayAgendaUseCase } from './application/use-cases/dashboard/get-today-agenda.use-case.js';
import { GetTodayAppointmentsCountUseCase } from './application/use-cases/dashboard/get-today-appointments-count.use-case.js';
import { ClientDashboardController } from './client-dashboard.controller.js';
import { GetClientDashboardSummaryUseCase } from './application/use-cases/client-dashboard/get-client-dashboard-summary.use-case.js';
import { PrismaClientDashboardRepository } from './infrastructure/repositories/prisma-client-dashboard.repository.js';
import { PrismaDashboardRepository } from './infrastructure/repositories/prisma-dashboard.repository.js';

@Module({
  imports: [AuthModule],
  controllers: [AdminDashboardController, ClientDashboardController],
  providers: [
    { provide: DiTokens.dashboardRepository, useClass: PrismaDashboardRepository },
    { provide: DiTokens.clientDashboardRepository, useClass: PrismaClientDashboardRepository },
    GetTodayAppointmentsCountUseCase,
    GetActiveClientsCountUseCase,
    GetPendingAppointmentsCountUseCase,
    GetTodayAgendaUseCase,
    GetClientDashboardSummaryUseCase,
  ],
})
export class DashboardModule {}
