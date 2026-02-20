import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { HOLIDAY_REPOSITORY } from '../../../domain/interfaces/holiday.repository.interface.js';
import { ListHolidaysUseCase } from './list-holidays.use-case.js';

describe('ListHolidaysUseCase', () => {
  let useCase: ListHolidaysUseCase;
  let holidayRepository: {
    findAllHolidays: Mock;
    findHolidaysByYear: Mock;
  };

  beforeEach(async () => {
    holidayRepository = {
      findAllHolidays: vi.fn(),
      findHolidaysByYear: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListHolidaysUseCase,
        { provide: HOLIDAY_REPOSITORY, useValue: holidayRepository },
      ],
    }).compile();

    useCase = module.get<ListHolidaysUseCase>(ListHolidaysUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should list all holidays when year is undefined', async () => {
    const holidays = [{ id: 1 }];
    holidayRepository.findAllHolidays.mockResolvedValue(holidays);

    const result = await useCase.listHolidays();

    expect(result).toEqual(holidays);
    expect(holidayRepository.findAllHolidays).toHaveBeenCalled();
    expect(holidayRepository.findHolidaysByYear).not.toHaveBeenCalled();
  });

  it('should list holidays by year when year is provided', async () => {
    const holidays = [{ id: 1, date: new Date('2026-01-01') }];
    holidayRepository.findHolidaysByYear.mockResolvedValue(holidays);

    const result = await useCase.listHolidays(2026);

    expect(result).toEqual(holidays);
    expect(holidayRepository.findHolidaysByYear).toHaveBeenCalledWith(2026);
    expect(holidayRepository.findAllHolidays).not.toHaveBeenCalled();
  });
});
