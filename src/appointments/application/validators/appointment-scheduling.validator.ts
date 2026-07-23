import { DiTokens } from '../../../shared/di/di-tokens.js';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { IHolidayRepository } from '../../../holidays/domain/interfaces/holiday.repository.interface.js';
import type {
  AppointmentResponse,
  ClientConflictCheckParams,
  ConflictCheckParams,
} from '../../domain/interfaces/appointment.repository.interface.js';

@Injectable()
export class AppointmentSchedulingValidator {
  constructor(@Inject(DiTokens.holidayRepository) private holidayRepository: IHolidayRepository) {}

  static buildRescheduleConflictCheck(
    existing: AppointmentResponse,
    newDate: Date,
    startTime: string,
  ): ConflictCheckParams | undefined {
    if (!existing.employee) {
      return undefined;
    }

    return {
      employeeId: existing.employee.id,
      date: newDate,
      startTime,
      duration: existing.duration,
      excludeId: existing.id,
    };
  }

  static buildRescheduleClientConflictCheck(
    existing: AppointmentResponse,
    clientId: number,
    newDate: Date,
    startTime: string,
  ): ClientConflictCheckParams {
    return {
      clientId,
      date: newDate,
      startTime,
      duration: existing.duration,
      excludeId: existing.id,
    };
  }

  async validateSchedulingDate(date: Date): Promise<void> {
    // Appointment.date is UTC midnight; compare against today's UTC midnight so past
    // days (D-1, D-N) are rejected without a timezone off-by-one.
    const now = new Date();
    const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    if (date.getTime() < todayUtc.getTime()) {
      throw new BadRequestException('Appointments cannot be scheduled in the past');
    }

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
