import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { ListUnitsUseCase } from './list-units.use-case.js';

describe('ListUnitsUseCase', () => {
  let useCase: ListUnitsUseCase;
  let unitRepository: { listUnits: Mock };

  beforeEach(async () => {
    unitRepository = {
      listUnits: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ListUnitsUseCase, { provide: DiTokens.unitRepository, useValue: unitRepository }],
    }).compile();

    useCase = module.get<ListUnitsUseCase>(ListUnitsUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return paginated units', async () => {
    const paginatedResult = {
      data: [
        { id: 1, name: 'Unidade Centro' },
        { id: 2, name: 'Unidade Norte' },
      ],
      total: 2,
      page: 1,
      limit: 20,
    };

    unitRepository.listUnits.mockResolvedValue(paginatedResult);

    const result = await useCase.listUnits({ page: 1, limit: 20 });

    expect(result).toEqual(paginatedResult);
    expect(unitRepository.listUnits).toHaveBeenCalledWith({ page: 1, limit: 20 });
  });
});
