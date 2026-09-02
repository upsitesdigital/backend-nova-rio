import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DiTokens } from '../../../shared/di/di-tokens.js';
import type { IAdminNotificationSettingRepository } from '../../domain/interfaces/admin-notification-setting.repository.interface.js';

@Injectable()
export class DeleteAdminNotificationSettingUseCase {
  constructor(
    @Inject(DiTokens.adminNotificationSettingRepository)
    private repo: IAdminNotificationSettingRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Notification setting not found');
    await this.repo.delete(id);
  }
}
