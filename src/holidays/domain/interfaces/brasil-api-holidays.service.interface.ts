export const BRASIL_API_HOLIDAYS_SERVICE = Symbol('BRASIL_API_HOLIDAYS_SERVICE');

export interface BrasilApiHoliday {
  date: string;
  name: string;
  type: string;
}

export interface IBrasilApiHolidaysService {
  fetchHolidaysByYear(year: number): Promise<BrasilApiHoliday[]>;
}
