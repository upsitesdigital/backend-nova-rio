import type { AppointmentStatus, PaymentStatus, RecurrenceType } from '@prisma/client';
import type { PaginatedResponse } from '../../../shared/types/paginated-response.type.js';

export interface AppointmentResponse {
  id: number;
  uuid: string;
  date: Date;
  startTime: string;
  duration: number;
  status: AppointmentStatus;
  recurrenceType: RecurrenceType;
  weeklyFrequency: number;
  locationZip: string | null;
  locationAddress: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  client: { id: number; name: string; email: string };
  service: { id: number; name: string };
  employee: { id: number; name: string } | null;
  package: { id: number; name: string } | null;
  unit: { id: number; name: string } | null;
  payment: { id: number; status: PaymentStatus } | null;
}

export type PaginatedAppointments = PaginatedResponse<AppointmentResponse>;

export interface CreateAppointmentData {
  date: Date;
  startTime: string;
  duration: number;
  recurrenceType?: RecurrenceType;
  weeklyFrequency?: number;
  locationZip?: string;
  locationAddress?: string;
  notes?: string;
  clientId: number;
  employeeId?: number;
  serviceId: number;
  packageId?: number;
  unitId?: number;
}

export interface UpdateAppointmentData {
  date?: Date;
  startTime?: string;
  duration?: number;
  recurrenceType?: RecurrenceType;
  weeklyFrequency?: number;
  locationZip?: string;
  locationAddress?: string;
  notes?: string;
  employeeId?: number;
  serviceId?: number;
  packageId?: number;
  unitId?: number;
}

export interface ConflictCheckParams {
  employeeId: number;
  date: Date;
  startTime: string;
  duration: number;
  excludeId?: number;
}

export interface ClientConflictCheckParams {
  clientId: number;
  date: Date;
  startTime: string;
  duration: number;
  excludeId?: number;
}

export interface ListAppointmentsFilters {
  date?: Date;
  weekStart?: Date;
  weekEnd?: Date;
  employeeId?: number;
  unitId?: number;
  status?: AppointmentStatus;
  page: number;
  limit: number;
}

export interface IAppointmentRepository {
  createAppointment(
    data: CreateAppointmentData,
    conflictCheck?: ConflictCheckParams,
    clientConflictCheck?: ClientConflictCheckParams,
  ): Promise<AppointmentResponse>;
  listAppointments(filters: ListAppointmentsFilters): Promise<PaginatedAppointments>;
  listAppointmentsByClientId(
    clientId: number,
    page: number,
    limit: number,
  ): Promise<PaginatedAppointments>;
  findAppointmentById(id: number): Promise<AppointmentResponse | null>;
  findAppointmentByIdAndClientId(id: number, clientId: number): Promise<AppointmentResponse | null>;
  updateAppointmentById(
    id: number,
    data: UpdateAppointmentData,
    conflictCheck?: ConflictCheckParams,
  ): Promise<AppointmentResponse>;
  cancelAppointmentById(id: number, clientId?: number): Promise<boolean>;
  completeAppointmentById(id: number): Promise<AppointmentResponse | null>;
  rescheduleAppointment(
    id: number,
    data: UpdateAppointmentData,
    conflictCheck?: ConflictCheckParams,
    clientConflictCheck?: ClientConflictCheckParams,
    clientId?: number,
  ): Promise<AppointmentResponse | null>;
}
