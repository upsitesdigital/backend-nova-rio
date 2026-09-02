import type { AdminNotificationEvent } from '../enums/admin-notification-event.enum.js';

export interface AdminNotificationSettingItem {
  id: number;
  uuid: string;
  email: string;
  events: AdminNotificationEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdminNotificationSettingRepository {
  findAll(): Promise<AdminNotificationSettingItem[]>;
  findById(id: number): Promise<AdminNotificationSettingItem | null>;
  findEmailsByEvent(event: AdminNotificationEvent): Promise<string[]>;
  create(email: string, events: AdminNotificationEvent[]): Promise<AdminNotificationSettingItem>;
  update(id: number, events: AdminNotificationEvent[]): Promise<AdminNotificationSettingItem>;
  delete(id: number): Promise<void>;
}
