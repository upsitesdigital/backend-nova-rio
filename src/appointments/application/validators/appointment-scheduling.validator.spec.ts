import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { HOLIDAY_REPOSITORY } from '../../../holidays/domain/interfaces/holiday.repository.interface.js';
import { AppointmentSchedulingValidator } from './appointment-scheduling.validator.js';

describe('AppointmentSchedulingValidator', () => {
  let validator: AppointmentSchedulingValidator;
  let holidayRepository: { findBlockedHolidayByDate: Mock };

  beforeEach(async () => {
    holidayRepository = { findBlockedHolidayByDate: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentSchedulingValidator,
        { provide: HOLIDAY_REPOSITORY, useValue: holidayRepository },
      ],
    }).compile();

    validator = module.get<AppointmentSchedulingValidator>(AppointmentSchedulingValidator);
  });

  it('should be defined', () => {
    expect(validator).toBeDefined();
  });

  describe('validateSchedulingDate', () => {
    it('should throw on Saturday', async () => {
      const saturday = new Date('2026-03-14'); // Saturday

      await expect(validator.validateSchedulingDate(saturday)).rejects.toThrow(BadRequestException);
    });

    it('should throw on Sunday', async () => {
      const sunday = new Date('2026-03-15'); // Sunday

      await expect(validator.validateSchedulingDate(sunday)).rejects.toThrow(BadRequestException);
    });

    it('should throw on blocked holiday', async () => {
      const date = new Date('2026-03-16'); // Monday
      holidayRepository.findBlockedHolidayByDate.mockResolvedValue({
        date: new Date('2026-03-16'),
        name: 'Holiday',
        isBlocked: true,
      });

      await expect(validator.validateSchedulingDate(date)).rejects.toThrow(BadRequestException);
    });

    it('should pass on valid weekday', async () => {
      const monday = new Date('2026-03-16'); // Monday
      holidayRepository.findBlockedHolidayByDate.mockResolvedValue(null);

      await expect(validator.validateSchedulingDate(monday)).resolves.toBeUndefined();
    });

    it('should pass on non-blocked holiday', async () => {
      const date = new Date('2026-03-16');
      holidayRepository.findBlockedHolidayByDate.mockResolvedValue(null);

      await expect(validator.validateSchedulingDate(date)).resolves.toBeUndefined();
    });
  });

  describe('validateCancellationAdvance', () => {
    it('should throw when less than 1h before appointment', () => {
      const now = new Date();
      const soonDate = new Date(now.getTime() + 30 * 60 * 1000); // 30 min from now
      const hours = String(soonDate.getUTCHours()).padStart(2, '0');
      const minutes = String(soonDate.getUTCMinutes()).padStart(2, '0');

      expect(() => validator.validateCancellationAdvance(soonDate, `${hours}:${minutes}`)).toThrow(
        BadRequestException,
      );
    });

    it('should pass when more than 1h before appointment', () => {
      const futureDate = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3h from now
      const hours = String(futureDate.getUTCHours()).padStart(2, '0');
      const minutes = String(futureDate.getUTCMinutes()).padStart(2, '0');

      expect(() =>
        validator.validateCancellationAdvance(futureDate, `${hours}:${minutes}`),
      ).not.toThrow();
    });
  });
});
