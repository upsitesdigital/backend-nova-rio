import { Module } from '@nestjs/common';
import { AdminDashboardController } from './admin-dashboard.controller.js';
import { GetActiveClientsCountUseCase } from './application/use-cases/dashboard/get-active-clients-count.use-case.js';
import { GetPendingAppointmentsCountUseCase } from './application/use-cases/dashboard/get-pending-appointments-count.use-case.js';
import { GetTodayAgendaUseCase } from './application/use-cases/dashboard/get-today-agenda.use-case.js';
import { GetTodayAppointmentsCountUseCase } from './application/use-cases/dashboard/get-today-appointments-count.use-case.js';
import { DASHBOARD_REPOSITORY } from './domain/interfaces/dashboard.repository.interface.js';
import { PrismaDashboardRepository } from './infrastructure/repositories/prisma-dashboard.repository.js';

@Module({
  controllers: [AdminDashboardController],
  providers: [
    { provide: DASHBOARD_REPOSITORY, useClass: PrismaDashboardRepository },
    GetTodayAppointmentsCountUseCase,
    GetActiveClientsCountUseCase,
    GetPendingAppointmentsCountUseCase,
    GetTodayAgendaUseCase,
  ],
})
export class DashboardModule {}
