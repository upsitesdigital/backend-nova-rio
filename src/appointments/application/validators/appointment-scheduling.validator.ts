import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { HOLIDAY_REPOSITORY } from '../../../holidays/domain/interfaces/holiday.repository.interface.js';
import type { IHolidayRepository } from '../../../holidays/domain/interfaces/holiday.repository.interface.js';

@Injectable()
export class AppointmentSchedulingValidator {
  constructor(@Inject(HOLIDAY_REPOSITORY) private holidayRepository: IHolidayRepository) {}

  async validateSchedulingDate(date: Date): Promise<void> {
    const dayOfWeek = date.getUTCDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      throw new BadRequestException('Appointments cannot be scheduled on weekends');
    }

    const blockedHoliday = await this.holidayRepository.findBlockedHolidayByDate(date);

    if (blockedHoliday) {
      throw new BadRequestException('Appointments cannot be scheduled on blocked holidays');
    }
  }

  validateCancellationAdvance(date: Date, startTime: string): void {
    const [hours, minutes] = startTime.split(':').map(Number);
    const appointmentDateTime = new Date(date);
    appointmentDateTime.setUTCHours(hours, minutes, 0, 0);

    const now = new Date();
    const diffMs = appointmentDateTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) {
      throw new BadRequestException(
        'Appointments can only be cancelled or rescheduled at least 1 hour in advance',
      );
    }
  }
}
