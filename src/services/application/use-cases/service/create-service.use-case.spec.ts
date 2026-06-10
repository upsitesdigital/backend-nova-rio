import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { CreateServiceUseCase } from './create-service.use-case.js';

describe('CreateServiceUseCase', () => {
  let useCase: CreateServiceUseCase;
  let serviceRepository: { createService: Mock };

  beforeEach(async () => {
    serviceRepository = {
      createService: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateServiceUseCase,
        { provide: DiTokens.serviceRepository, useValue: serviceRepository },
      ],
    }).compile();

    useCase = module.get<CreateServiceUseCase>(CreateServiceUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should call serviceRepository.createService with dto', async () => {
    const dto = { name: 'Faxina Regular', basePrice: 150 };
    const created = {
      id: 1,
      uuid: 'uuid-123',
      name: 'Faxina Regular',
      description: null,
      icon: null,
      basePrice: '150.00',
      allowSingle: true,
      allowPackage: false,
      allowRecurrence: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    serviceRepository.createService.mockResolvedValue(created);

    const result = await useCase.createService(dto);

    expect(result).toEqual(created);
    expect(serviceRepository.createService).toHaveBeenCalledWith(dto);
  });
});
