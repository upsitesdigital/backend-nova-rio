import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { UpdateHolidayUseCase } from './update-holiday.use-case.js';

describe('UpdateHolidayUseCase', () => {
  let useCase: UpdateHolidayUseCase;
  let holidayRepository: {
    findHolidayById: Mock;
    updateHolidayById: Mock;
  };

  beforeEach(async () => {
    holidayRepository = {
      findHolidayById: vi.fn(),
      updateHolidayById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateHolidayUseCase,
        { provide: DiTokens.holidayRepository, useValue: holidayRepository },
      ],
    }).compile();

    useCase = module.get<UpdateHolidayUseCase>(UpdateHolidayUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update holiday when found', async () => {
    const holiday = { id: 1, name: 'Old Name' };
    const dto = { name: 'New Name' };
    holidayRepository.findHolidayById.mockResolvedValue(holiday);
    holidayRepository.updateHolidayById.mockResolvedValue({ ...holiday, ...dto });

    const result = await useCase.updateHolidayById(1, dto);

    expect(result.name).toBe(dto.name);
    expect(holidayRepository.findHolidayById).toHaveBeenCalledWith(1);
    expect(holidayRepository.updateHolidayById).toHaveBeenCalledWith(
      1,
      expect.objectContaining(dto),
    );
  });

  it('should throw NotFoundException when holiday not found', async () => {
    holidayRepository.findHolidayById.mockResolvedValue(null);

    await expect(useCase.updateHolidayById(1, {})).rejects.toThrow(NotFoundException);
    expect(holidayRepository.updateHolidayById).not.toHaveBeenCalled();
  });
});
