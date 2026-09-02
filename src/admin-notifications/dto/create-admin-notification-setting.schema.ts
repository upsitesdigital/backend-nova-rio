import { z } from 'zod';
import { AdminNotificationEvent } from '../domain/enums/admin-notification-event.enum.js';

const allEvents = Object.values(AdminNotificationEvent) as [
  AdminNotificationEvent,
  ...AdminNotificationEvent[],
];

export const CreateAdminNotificationSettingSchema = z.object({
  email: z.string().email(),
  events: z.array(z.enum(allEvents)).min(1),
});

export const UpdateAdminNotificationSettingSchema = z.object({
  events: z.array(z.enum(allEvents)),
});
