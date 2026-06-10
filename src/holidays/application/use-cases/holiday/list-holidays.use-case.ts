import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable } from '@nestjs/common';
import type { Holiday } from '@prisma/client';
import { type IHolidayRepository } from '../../../domain/interfaces/holiday.repository.interface.js';

@Injectable()
export class ListHolidaysUseCase {
  constructor(@Inject(DiTokens.holidayRepository) private holidayRepository: IHolidayRepository) {}

  async listHolidays(year?: number): Promise<Holiday[]> {
    if (year) {
      return this.holidayRepository.findHolidaysByYear(year);
    }

    return this.holidayRepository.findAllHolidays();
  }
}
