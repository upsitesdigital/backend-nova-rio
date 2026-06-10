import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { ListServicesUseCase } from './list-services.use-case.js';

describe('ListServicesUseCase', () => {
  let useCase: ListServicesUseCase;
  let serviceRepository: { findAllActiveServices: Mock };

  beforeEach(async () => {
    serviceRepository = {
      findAllActiveServices: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListServicesUseCase,
        { provide: DiTokens.serviceRepository, useValue: serviceRepository },
      ],
    }).compile();

    useCase = module.get<ListServicesUseCase>(ListServicesUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return paginated active services', async () => {
    const paginatedResult = {
      data: [
        { id: 1, name: 'Faxina Regular', isActive: true },
        { id: 2, name: 'Faxina Premium', isActive: true },
      ],
      total: 2,
      page: 1,
      limit: 20,
    };

    serviceRepository.findAllActiveServices.mockResolvedValue(paginatedResult);

    const result = await useCase.listActiveServices({ page: 1, limit: 20 });

    expect(result).toEqual(paginatedResult);
    expect(serviceRepository.findAllActiveServices).toHaveBeenCalledWith({ page: 1, limit: 20 });
  });

  it('should return empty data when no active services', async () => {
    const paginatedResult = { data: [], total: 0, page: 1, limit: 20 };

    serviceRepository.findAllActiveServices.mockResolvedValue(paginatedResult);

    const result = await useCase.listActiveServices({ page: 1, limit: 20 });

    expect(result).toEqual(paginatedResult);
  });
});
