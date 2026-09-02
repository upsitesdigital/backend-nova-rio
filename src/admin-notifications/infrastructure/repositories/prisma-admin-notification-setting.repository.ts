import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { AdminNotificationEvent } from '../../domain/enums/admin-notification-event.enum.js';
import type {
  AdminNotificationSettingItem,
  IAdminNotificationSettingRepository,
} from '../../domain/interfaces/admin-notification-setting.repository.interface.js';

@Injectable()
export class PrismaAdminNotificationSettingRepository implements IAdminNotificationSettingRepository {
  constructor(private prisma: PrismaService) {}

  private map(raw: {
    id: number;
    uuid: string;
    email: string;
    events: string[];
    createdAt: Date;
    updatedAt: Date;
  }): AdminNotificationSettingItem {
    return {
      ...raw,
      events: raw.events as AdminNotificationEvent[],
    };
  }

  async findAll(): Promise<AdminNotificationSettingItem[]> {
    const rows = await this.prisma.adminNotificationSetting.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => this.map(r));
  }

  async findById(id: number): Promise<AdminNotificationSettingItem | null> {
    const row = await this.prisma.adminNotificationSetting.findUnique({ where: { id } });
    return row ? this.map(row) : null;
  }

  async findEmailsByEvent(event: AdminNotificationEvent): Promise<string[]> {
    const rows = await this.prisma.adminNotificationSetting.findMany({
      where: { events: { has: event } },
      select: { email: true },
    });
    return rows.map((r) => r.email);
  }

  async create(
    email: string,
    events: AdminNotificationEvent[],
  ): Promise<AdminNotificationSettingItem> {
    const row = await this.prisma.adminNotificationSetting.create({
      data: { email, events },
    });
    return this.map(row);
  }

  async update(
    id: number,
    events: AdminNotificationEvent[],
  ): Promise<AdminNotificationSettingItem> {
    const row = await this.prisma.adminNotificationSetting.update({
      where: { id },
      data: { events },
    });
    return this.map(row);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.adminNotificationSetting.delete({ where: { id } });
  }
}
