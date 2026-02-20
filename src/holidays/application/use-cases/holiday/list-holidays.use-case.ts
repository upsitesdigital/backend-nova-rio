import { Inject, Injectable } from '@nestjs/common';
import type { Holiday } from '@prisma/client';
import {
  HOLIDAY_REPOSITORY,
  type IHolidayRepository,
} from '../../../domain/interfaces/holiday.repository.interface.js';

@Injectable()
export class ListHolidaysUseCase {
  constructor(@Inject(HOLIDAY_REPOSITORY) private holidayRepository: IHolidayRepository) {}

  async listHolidays(year?: number): Promise<Holiday[]> {
    if (year) {
      return this.holidayRepository.findHolidaysByYear(year);
    }

    return this.holidayRepository.findAllHolidays();
  }
}
