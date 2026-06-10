import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { GetUnitUseCase } from './get-unit.use-case.js';

describe('GetUnitUseCase', () => {
  let useCase: GetUnitUseCase;
  let unitRepository: { findUnitById: Mock };

  beforeEach(async () => {
    unitRepository = {
      findUnitById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [GetUnitUseCase, { provide: DiTokens.unitRepository, useValue: unitRepository }],
    }).compile();

    useCase = module.get<GetUnitUseCase>(GetUnitUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return a unit by id', async () => {
    const unit = { id: 1, name: 'Unidade Centro' };

    unitRepository.findUnitById.mockResolvedValue(unit);

    const result = await useCase.getUnitById(1);

    expect(result).toEqual(unit);
    expect(unitRepository.findUnitById).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException when unit not found', async () => {
    unitRepository.findUnitById.mockResolvedValue(null);

    await expect(useCase.getUnitById(999)).rejects.toThrow(NotFoundException);
  });
});
