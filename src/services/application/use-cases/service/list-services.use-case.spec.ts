import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { SERVICE_REPOSITORY } from '../../../domain/interfaces/service.repository.interface.js';
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
        { provide: SERVICE_REPOSITORY, useValue: serviceRepository },
      ],
    }).compile();

    useCase = module.get<ListServicesUseCase>(ListServicesUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return all active services', async () => {
    const services = [
      { id: 1, name: 'Faxina Regular', isActive: true },
      { id: 2, name: 'Faxina Premium', isActive: true },
    ];

    serviceRepository.findAllActiveServices.mockResolvedValue(services);

    const result = await useCase.listActiveServices();

    expect(result).toEqual(services);
    expect(serviceRepository.findAllActiveServices).toHaveBeenCalled();
  });

  it('should return empty array when no active services', async () => {
    serviceRepository.findAllActiveServices.mockResolvedValue([]);

    const result = await useCase.listActiveServices();

    expect(result).toEqual([]);
  });
});
