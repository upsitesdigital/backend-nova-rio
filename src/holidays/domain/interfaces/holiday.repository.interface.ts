import type { Holiday, HolidayType } from '@prisma/client';

export interface CreateHolidayData {
  date: Date;
  name: string;
  type?: HolidayType;
  isBlocked?: boolean;
}

export interface UpdateHolidayData {
  date?: Date;
  name?: string;
  type?: HolidayType;
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
  bulkUpsertHolidays(holidays: CreateHolidayData[]): Promise<void>;
}
