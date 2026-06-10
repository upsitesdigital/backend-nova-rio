import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { type IHolidayRepository } from '../../../domain/interfaces/holiday.repository.interface.js';

@Injectable()
export class DeleteHolidayUseCase {
  constructor(@Inject(DiTokens.holidayRepository) private holidayRepository: IHolidayRepository) {}

  async deleteHolidayById(id: number): Promise<void> {
    const existing = await this.holidayRepository.findHolidayById(id);

    if (!existing) {
      throw new NotFoundException('Holiday not found');
    }

    await this.holidayRepository.deleteHolidayById(id);
  }
}
