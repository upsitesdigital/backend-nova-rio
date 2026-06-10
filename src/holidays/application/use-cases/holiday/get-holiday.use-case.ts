import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Holiday } from '@prisma/client';
import { type IHolidayRepository } from '../../../domain/interfaces/holiday.repository.interface.js';

@Injectable()
export class GetHolidayUseCase {
  constructor(@Inject(DiTokens.holidayRepository) private holidayRepository: IHolidayRepository) {}

  async getHolidayById(id: number): Promise<Holiday> {
    const holiday = await this.holidayRepository.findHolidayById(id);

    if (!holiday) {
      throw new NotFoundException('Holiday not found');
    }

    return holiday;
  }
}
