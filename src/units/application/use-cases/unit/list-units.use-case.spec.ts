import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { UNIT_REPOSITORY } from '../../../domain/interfaces/unit.repository.interface.js';
import { ListUnitsUseCase } from './list-units.use-case.js';

describe('ListUnitsUseCase', () => {
  let useCase: ListUnitsUseCase;
  let unitRepository: { listUnits: Mock };

  beforeEach(async () => {
    unitRepository = {
      listUnits: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ListUnitsUseCase, { provide: UNIT_REPOSITORY, useValue: unitRepository }],
    }).compile();

    useCase = module.get<ListUnitsUseCase>(ListUnitsUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return all units', async () => {
    const units = [
      { id: 1, name: 'Unidade Centro' },
      { id: 2, name: 'Unidade Norte' },
    ];

    unitRepository.listUnits.mockResolvedValue(units);

    const result = await useCase.listUnits();

    expect(result).toEqual(units);
    expect(unitRepository.listUnits).toHaveBeenCalled();
  });
});
