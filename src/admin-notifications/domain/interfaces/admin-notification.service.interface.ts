import type { AdminNotificationEvent } from '../enums/admin-notification-event.enum.js';

export interface NewClientPayload {
  clientName: string;
  clientEmail: string;
}

export interface NewAppointmentPayload {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
}

export interface AppointmentCancelledPayload {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
}

export interface AppointmentRescheduledPayload {
  clientName: string;
  serviceName: string;
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
}

export interface PaymentReceivedPayload {
  clientName: string;
  serviceName: string;
  amount: string;
  date: string;
}

export interface PaymentCancelledPayload {
  clientName: string;
  serviceName: string;
  amount: string;
}

export interface AccountDeletedPayload {
  clientName: string;
  clientEmail: string;
}

export type AdminNotificationPayload =
  | { event: AdminNotificationEvent.NEW_CLIENT; data: NewClientPayload }
  | { event: AdminNotificationEvent.NEW_APPOINTMENT; data: NewAppointmentPayload }
  | { event: AdminNotificationEvent.APPOINTMENT_CANCELLED; data: AppointmentCancelledPayload }
  | { event: AdminNotificationEvent.APPOINTMENT_RESCHEDULED; data: AppointmentRescheduledPayload }
  | { event: AdminNotificationEvent.PAYMENT_RECEIVED; data: PaymentReceivedPayload }
  | { event: AdminNotificationEvent.PAYMENT_CANCELLED; data: PaymentCancelledPayload }
  | { event: AdminNotificationEvent.ACCOUNT_DELETED; data: AccountDeletedPayload };

export interface IAdminNotificationService {
  dispatch(notification: AdminNotificationPayload): Promise<void>;
}
