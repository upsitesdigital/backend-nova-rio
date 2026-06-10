export interface BrasilApiHoliday {
  date: string;
  name: string;
  type: string;
}

export interface IBrasilApiHolidaysService {
  fetchHolidaysByYear(year: number): Promise<BrasilApiHoliday[]>;
}
