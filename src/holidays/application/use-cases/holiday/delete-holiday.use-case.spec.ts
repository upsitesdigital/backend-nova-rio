import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { DeleteHolidayUseCase } from './delete-holiday.use-case.js';

describe('DeleteHolidayUseCase', () => {
  let useCase: DeleteHolidayUseCase;
  let holidayRepository: {
    findHolidayById: Mock;
    deleteHolidayById: Mock;
  };

  beforeEach(async () => {
    holidayRepository = {
      findHolidayById: vi.fn(),
      deleteHolidayById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteHolidayUseCase,
        { provide: DiTokens.holidayRepository, useValue: holidayRepository },
      ],
    }).compile();

    useCase = module.get<DeleteHolidayUseCase>(DeleteHolidayUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should delete holiday when found', async () => {
    holidayRepository.findHolidayById.mockResolvedValue({ id: 1 });

    await useCase.deleteHolidayById(1);

    expect(holidayRepository.findHolidayById).toHaveBeenCalledWith(1);
    expect(holidayRepository.deleteHolidayById).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException when holiday not found', async () => {
    holidayRepository.findHolidayById.mockResolvedValue(null);

    await expect(useCase.deleteHolidayById(1)).rejects.toThrow(NotFoundException);
    expect(holidayRepository.deleteHolidayById).not.toHaveBeenCalled();
  });
});
