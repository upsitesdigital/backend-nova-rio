import { Injectable } from '@nestjs/common';
import type { Holiday } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type {
  CreateHolidayData,
  IHolidayRepository,
  UpdateHolidayData,
} from '../../domain/interfaces/holiday.repository.interface.js';

@Injectable()
export class PrismaHolidayRepository implements IHolidayRepository {
  constructor(private prisma: PrismaService) {}

  async createHoliday(data: CreateHolidayData): Promise<Holiday> {
    return this.prisma.holiday.create({ data });
  }

  async findAllHolidays(): Promise<Holiday[]> {
    return this.prisma.holiday.findMany({ orderBy: { date: 'asc' } });
  }

  async findHolidaysByYear(year: number): Promise<Holiday[]> {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year + 1}-01-01`);

    return this.prisma.holiday.findMany({
      where: { date: { gte: startDate, lt: endDate } },
      orderBy: { date: 'asc' },
    });
  }

  async findHolidayById(id: number): Promise<Holiday | null> {
    return this.prisma.holiday.findUnique({ where: { id } });
  }

  async updateHolidayById(id: number, data: UpdateHolidayData): Promise<Holiday> {
    return this.prisma.holiday.update({ where: { id }, data });
  }

  async deleteHolidayById(id: number): Promise<void> {
    await this.prisma.holiday.delete({ where: { id } });
  }

  async upsertHolidayByDate(data: CreateHolidayData): Promise<Holiday> {
    return this.prisma.holiday.upsert({
      where: { date: data.date },
      update: { name: data.name, type: data.type },
      create: data,
    });
  }
}
