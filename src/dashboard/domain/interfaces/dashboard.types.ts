import type { AppointmentStatus } from '@prisma/client';

export interface DashboardFilters {
  unitId?: number;
}

export interface TodayAgendaFilters {
  serviceId?: number;
  unitId?: number;
  page?: number;
  limit?: number;
}

export interface AgendaItem {
  appointmentId: number;
  clientName: string;
  serviceName: string;
  startTime: string;
  duration: number;
  status: AppointmentStatus;
  date: Date;
}

export interface TodayAgendaResponse {
  items: AgendaItem[];
  total: number;
  page: number;
  limit: number;
}
