import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  HOLIDAY_REPOSITORY,
  type IHolidayRepository,
} from '../../../domain/interfaces/holiday.repository.interface.js';

@Injectable()
export class DeleteHolidayUseCase {
  constructor(@Inject(HOLIDAY_REPOSITORY) private holidayRepository: IHolidayRepository) {}

  async deleteHolidayById(id: number): Promise<void> {
    const existing = await this.holidayRepository.findHolidayById(id);

    if (!existing) {
      throw new NotFoundException('Holiday not found');
    }

    await this.holidayRepository.deleteHolidayById(id);
  }
}
