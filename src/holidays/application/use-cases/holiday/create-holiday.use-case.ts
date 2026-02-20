import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { Holiday } from '@prisma/client';
import {
  HOLIDAY_REPOSITORY,
  type IHolidayRepository,
} from '../../../domain/interfaces/holiday.repository.interface.js';
import type { CreateHolidayDto } from '../../../dto/holiday/create-holiday.dto.js';

@Injectable()
export class CreateHolidayUseCase {
  constructor(@Inject(HOLIDAY_REPOSITORY) private holidayRepository: IHolidayRepository) {}

  async createHoliday(dto: CreateHolidayDto): Promise<Holiday> {
    const date = new Date(dto.date);

    const existing = await this.holidayRepository.findHolidaysByYear(date.getFullYear());
    const duplicate = existing.find((h) => h.date.toISOString().slice(0, 10) === dto.date);

    if (duplicate) {
      throw new ConflictException(`A holiday already exists on ${dto.date}`);
    }

    return this.holidayRepository.createHoliday({
      date,
      name: dto.name,
      isBlocked: dto.isBlocked,
    });
  }
}
