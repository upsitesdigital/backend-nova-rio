import { Module } from '@nestjs/common';
import { DiTokens } from '../shared/di/di-tokens.js';
import { AdminNotificationService } from './application/services/admin-notification.service.js';
import { CreateAdminNotificationSettingUseCase } from './application/use-cases/create-admin-notification-setting.use-case.js';
import { DeleteAdminNotificationSettingUseCase } from './application/use-cases/delete-admin-notification-setting.use-case.js';
import { ListAdminNotificationSettingsUseCase } from './application/use-cases/list-admin-notification-settings.use-case.js';
import { UpdateAdminNotificationSettingUseCase } from './application/use-cases/update-admin-notification-setting.use-case.js';
import { PrismaAdminNotificationSettingRepository } from './infrastructure/repositories/prisma-admin-notification-setting.repository.js';

@Module({
  providers: [
    {
      provide: DiTokens.adminNotificationSettingRepository,
      useClass: PrismaAdminNotificationSettingRepository,
    },
    {
      provide: DiTokens.adminNotificationService,
      useClass: AdminNotificationService,
    },
    AdminNotificationService,
    ListAdminNotificationSettingsUseCase,
    CreateAdminNotificationSettingUseCase,
    UpdateAdminNotificationSettingUseCase,
    DeleteAdminNotificationSettingUseCase,
  ],
  exports: [
    DiTokens.adminNotificationSettingRepository,
    DiTokens.adminNotificationService,
    AdminNotificationService,
    ListAdminNotificationSettingsUseCase,
    CreateAdminNotificationSettingUseCase,
    UpdateAdminNotificationSettingUseCase,
    DeleteAdminNotificationSettingUseCase,
  ],
})
export class AdminNotificationCoreModule {}
