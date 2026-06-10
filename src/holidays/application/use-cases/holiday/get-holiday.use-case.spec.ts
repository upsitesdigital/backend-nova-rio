import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { GetHolidayUseCase } from './get-holiday.use-case.js';

describe('GetHolidayUseCase', () => {
  let useCase: GetHolidayUseCase;
  let holidayRepository: {
    findHolidayById: Mock;
  };

  beforeEach(async () => {
    holidayRepository = {
      findHolidayById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetHolidayUseCase,
        { provide: DiTokens.holidayRepository, useValue: holidayRepository },
      ],
    }).compile();

    useCase = module.get<GetHolidayUseCase>(GetHolidayUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return holiday when found', async () => {
    const holiday = { id: 1, name: 'Holiday' };
    holidayRepository.findHolidayById.mockResolvedValue(holiday);

    const result = await useCase.getHolidayById(1);

    expect(result).toEqual(holiday);
    expect(holidayRepository.findHolidayById).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException when holiday not found', async () => {
    holidayRepository.findHolidayById.mockResolvedValue(null);

    await expect(useCase.getHolidayById(1)).rejects.toThrow(NotFoundException);
  });
});
