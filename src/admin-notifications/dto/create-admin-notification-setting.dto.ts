import { createZodDto } from 'nestjs-zod';
import {
  CreateAdminNotificationSettingSchema,
  UpdateAdminNotificationSettingSchema,
} from './create-admin-notification-setting.schema.js';

export class CreateAdminNotificationSettingDto extends createZodDto(
  CreateAdminNotificationSettingSchema,
) {}

export class UpdateAdminNotificationSettingDto extends createZodDto(
  UpdateAdminNotificationSettingSchema,
) {}
