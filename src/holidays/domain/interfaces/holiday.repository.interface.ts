import type { Holiday } from '@prisma/client';

export const HOLIDAY_REPOSITORY = Symbol('HOLIDAY_REPOSITORY');

export interface CreateHolidayData {
  date: Date;
  name: string;
  type?: string;
  isBlocked?: boolean;
}

export interface UpdateHolidayData {
  date?: Date;
  name?: string;
  isBlocked?: boolean;
}

export interface IHolidayRepository {
  createHoliday(data: CreateHolidayData): Promise<Holiday>;
  findAllHolidays(): Promise<Holiday[]>;
  findHolidaysByYear(year: number): Promise<Holiday[]>;
  findBlockedHolidayByDate(date: Date): Promise<Holiday | null>;
  findHolidayById(id: number): Promise<Holiday | null>;
  updateHolidayById(id: number, data: UpdateHolidayData): Promise<Holiday>;
  deleteHolidayById(id: number): Promise<void>;
  upsertHolidayByDate(data: CreateHolidayData): Promise<Holiday>;
}
