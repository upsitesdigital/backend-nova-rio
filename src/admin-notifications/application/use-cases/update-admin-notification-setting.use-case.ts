import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DiTokens } from '../../../shared/di/di-tokens.js';
import type { IAdminNotificationSettingRepository } from '../../domain/interfaces/admin-notification-setting.repository.interface.js';
import type { UpdateAdminNotificationSettingDto } from '../../dto/create-admin-notification-setting.dto.js';

@Injectable()
export class UpdateAdminNotificationSettingUseCase {
  constructor(
    @Inject(DiTokens.adminNotificationSettingRepository)
    private repo: IAdminNotificationSettingRepository,
  ) {}

  async execute(id: number, dto: UpdateAdminNotificationSettingDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Notification setting not found');
    return this.repo.update(id, dto.events);
  }
}
