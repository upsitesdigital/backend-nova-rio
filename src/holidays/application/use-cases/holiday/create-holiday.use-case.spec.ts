import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { HOLIDAY_REPOSITORY } from '../../../domain/interfaces/holiday.repository.interface.js';
import { CreateHolidayUseCase } from './create-holiday.use-case.js';

describe('CreateHolidayUseCase', () => {
  let useCase: CreateHolidayUseCase;
  let holidayRepository: {
    createHoliday: Mock;
    findHolidaysByYear: Mock;
  };

  beforeEach(async () => {
    holidayRepository = {
      createHoliday: vi.fn(),
      findHolidaysByYear: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateHolidayUseCase,
        { provide: HOLIDAY_REPOSITORY, useValue: holidayRepository },
      ],
    }).compile();

    useCase = module.get<CreateHolidayUseCase>(CreateHolidayUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create holiday when no duplicate exists', async () => {
    const dto = {
      date: '2026-12-25',
      name: 'Natal',
      type: 'national',
      isBlocked: true,
    };
    const created = { id: 1, ...dto, uuid: 'uuid-1', date: new Date(dto.date) };

    holidayRepository.findHolidaysByYear.mockResolvedValue([]);
    holidayRepository.createHoliday.mockResolvedValue(created);

    const result = await useCase.createHoliday(dto);

    expect(result).toEqual(created);
    expect(holidayRepository.findHolidaysByYear).toHaveBeenCalledWith(2026);

    const callArg = holidayRepository.createHoliday.mock.calls[0][0] as {
      date: Date;
      name: string;
      isBlocked: boolean;
    };
    expect(callArg.date).toBeInstanceOf(Date);
    expect(callArg.name).toBe(dto.name);
    expect(callArg.isBlocked).toBe(dto.isBlocked);
  });

  it('should throw ConflictException when holiday already exists on date', async () => {
    const dto = {
      date: '2026-12-25',
      name: 'Natal',
      type: 'national',
      isBlocked: true,
    };

    holidayRepository.findHolidaysByYear.mockResolvedValue([
      { date: new Date('2026-12-25T00:00:00.000Z'), name: 'Existing Holiday' },
    ]);

    await expect(useCase.createHoliday(dto)).rejects.toThrow(ConflictException);
    expect(holidayRepository.createHoliday).not.toHaveBeenCalled();
  });
});
