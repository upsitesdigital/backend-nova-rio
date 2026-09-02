import { Inject, Injectable } from '@nestjs/common';
import { DiTokens } from '../../../shared/di/di-tokens.js';
import type { IAdminNotificationSettingRepository } from '../../domain/interfaces/admin-notification-setting.repository.interface.js';

@Injectable()
export class ListAdminNotificationSettingsUseCase {
  constructor(
    @Inject(DiTokens.adminNotificationSettingRepository)
    private repo: IAdminNotificationSettingRepository,
  ) {}

  async execute() {
    return this.repo.findAll();
  }
}
