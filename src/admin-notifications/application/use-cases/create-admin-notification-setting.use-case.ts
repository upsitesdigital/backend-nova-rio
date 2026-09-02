import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { DiTokens } from '../../../shared/di/di-tokens.js';
import type { IAdminNotificationSettingRepository } from '../../domain/interfaces/admin-notification-setting.repository.interface.js';
import type { CreateAdminNotificationSettingDto } from '../../dto/create-admin-notification-setting.dto.js';

@Injectable()
export class CreateAdminNotificationSettingUseCase {
  constructor(
    @Inject(DiTokens.adminNotificationSettingRepository)
    private repo: IAdminNotificationSettingRepository,
  ) {}

  async execute(dto: CreateAdminNotificationSettingDto) {
    const all = await this.repo.findAll();
    if (all.some((s) => s.email === dto.email)) {
      throw new ConflictException('Email already registered for notifications');
    }
    return this.repo.create(dto.email, dto.events);
  }
}
