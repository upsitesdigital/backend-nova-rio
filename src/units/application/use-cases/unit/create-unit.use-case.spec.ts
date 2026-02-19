import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { UNIT_REPOSITORY } from '../../../domain/interfaces/unit.repository.interface.js';
import { CreateUnitUseCase } from './create-unit.use-case.js';

describe('CreateUnitUseCase', () => {
  let useCase: CreateUnitUseCase;
  let unitRepository: { findUnitByName: Mock; createUnit: Mock };

  beforeEach(async () => {
    unitRepository = {
      findUnitByName: vi.fn(),
      createUnit: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateUnitUseCase, { provide: UNIT_REPOSITORY, useValue: unitRepository }],
    }).compile();

    useCase = module.get<CreateUnitUseCase>(CreateUnitUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a unit when name is unique', async () => {
    const dto = { name: 'Unidade Centro' };
    const created = {
      id: 1,
      uuid: 'uuid-123',
      name: 'Unidade Centro',
      address: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    unitRepository.findUnitByName.mockResolvedValue(null);
    unitRepository.createUnit.mockResolvedValue(created);

    const result = await useCase.createUnit(dto);

    expect(result).toEqual(created);
    expect(unitRepository.findUnitByName).toHaveBeenCalledWith('Unidade Centro');
    expect(unitRepository.createUnit).toHaveBeenCalledWith(dto);
  });

  it('should throw ConflictException when name already exists', async () => {
    const dto = { name: 'Unidade Centro' };

    unitRepository.findUnitByName.mockResolvedValue({ id: 1, name: 'Unidade Centro' });

    await expect(useCase.createUnit(dto)).rejects.toThrow(ConflictException);
    expect(unitRepository.createUnit).not.toHaveBeenCalled();
  });
});
