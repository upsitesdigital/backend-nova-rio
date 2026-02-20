import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Holiday } from '@prisma/client';
import {
  HOLIDAY_REPOSITORY,
  type IHolidayRepository,
} from '../../../domain/interfaces/holiday.repository.interface.js';
import type { UpdateHolidayDto } from '../../../dto/holiday/update-holiday.dto.js';

@Injectable()
export class UpdateHolidayUseCase {
  constructor(@Inject(HOLIDAY_REPOSITORY) private holidayRepository: IHolidayRepository) {}

  async updateHolidayById(id: number, dto: UpdateHolidayDto): Promise<Holiday> {
    const existing = await this.holidayRepository.findHolidayById(id);

    if (!existing) {
      throw new NotFoundException('Holiday not found');
    }

    return this.holidayRepository.updateHolidayById(id, {
      ...(dto.date && { date: new Date(dto.date) }),
      ...(dto.name && { name: dto.name }),
      ...(dto.isBlocked !== undefined && { isBlocked: dto.isBlocked }),
    });
  }
}
