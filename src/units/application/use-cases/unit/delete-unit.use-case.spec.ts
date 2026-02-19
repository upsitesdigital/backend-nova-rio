import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { UNIT_REPOSITORY } from '../../../domain/interfaces/unit.repository.interface.js';
import { DeleteUnitUseCase } from './delete-unit.use-case.js';

describe('DeleteUnitUseCase', () => {
  let useCase: DeleteUnitUseCase;
  let unitRepository: { findUnitById: Mock; deleteUnitById: Mock };

  beforeEach(async () => {
    unitRepository = {
      findUnitById: vi.fn(),
      deleteUnitById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [DeleteUnitUseCase, { provide: UNIT_REPOSITORY, useValue: unitRepository }],
    }).compile();

    useCase = module.get<DeleteUnitUseCase>(DeleteUnitUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should delete a unit by id', async () => {
    const existing = { id: 1, name: 'Unidade Centro' };

    unitRepository.findUnitById.mockResolvedValue(existing);
    unitRepository.deleteUnitById.mockResolvedValue(undefined);

    await useCase.deleteUnitById(1);

    expect(unitRepository.findUnitById).toHaveBeenCalledWith(1);
    expect(unitRepository.deleteUnitById).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException if unit not found', async () => {
    unitRepository.findUnitById.mockResolvedValue(null);

    await expect(useCase.deleteUnitById(999)).rejects.toThrow(NotFoundException);
    expect(unitRepository.deleteUnitById).not.toHaveBeenCalled();
  });
});
