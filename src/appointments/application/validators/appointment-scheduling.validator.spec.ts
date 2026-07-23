import { DiTokens } from '../../../shared/di/di-tokens.js';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { AppointmentSchedulingValidator } from './appointment-scheduling.validator.js';

describe('AppointmentSchedulingValidator', () => {
  let validator: AppointmentSchedulingValidator;
  let holidayRepository: { findBlockedHolidayByDate: Mock };

  beforeEach(async () => {
    holidayRepository = { findBlockedHolidayByDate: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentSchedulingValidator,
        { provide: DiTokens.holidayRepository, useValue: holidayRepository },
      ],
    }).compile();

    validator = module.get<AppointmentSchedulingValidator>(AppointmentSchedulingValidator);
  });

  it('should be defined', () => {
    expect(validator).toBeDefined();
  });

  // Dates are computed relative to "now" so the past-date guard never makes the
  // suite drift-dependent. 0=Sun … 6=Sat.
  function futureDateOnWeekday(targetDow: number): Date {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() + 14);
    while (d.getUTCDay() !== targetDow) {
      d.setUTCDate(d.getUTCDate() + 1);
    }
    return d;
  }

  describe('validateSchedulingDate', () => {
    it('should throw on a past date (D-1)', async () => {
      const now = new Date();
      const yesterday = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1),
      );

      await expect(validator.validateSchedulingDate(yesterday)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw on Saturday', async () => {
      await expect(validator.validateSchedulingDate(futureDateOnWeekday(6))).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw on Sunday', async () => {
      await expect(validator.validateSchedulingDate(futureDateOnWeekday(0))).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw on blocked holiday', async () => {
      const monday = futureDateOnWeekday(1);
      holidayRepository.findBlockedHolidayByDate.mockResolvedValue({
        date: monday,
        name: 'Holiday',
        isBlocked: true,
      });

      await expect(validator.validateSchedulingDate(monday)).rejects.toThrow(BadRequestException);
    });

    it('should pass on a valid future weekday', async () => {
      holidayRepository.findBlockedHolidayByDate.mockResolvedValue(null);

      await expect(
        validator.validateSchedulingDate(futureDateOnWeekday(1)),
      ).resolves.toBeUndefined();
    });

    it('should pass on non-blocked holiday', async () => {
      holidayRepository.findBlockedHolidayByDate.mockResolvedValue(null);

      await expect(
        validator.validateSchedulingDate(futureDateOnWeekday(3)),
      ).resolves.toBeUndefined();
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
