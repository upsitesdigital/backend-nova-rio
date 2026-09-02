import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { AdminNotificationCoreModule } from './admin-notifications-core.module.js';
import { AdminNotificationsController } from './admin-notifications.controller.js';

@Module({
  imports: [AuthModule, AdminNotificationCoreModule],
  controllers: [AdminNotificationsController],
})
export class AdminNotificationsModule {}
