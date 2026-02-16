import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { SERVICE_REPOSITORY } from '../../../domain/interfaces/service.repository.interface.js';
import { GetServiceUseCase } from './get-service.use-case.js';

describe('GetServiceUseCase', () => {
  let useCase: GetServiceUseCase;
  let serviceRepository: { findServiceById: Mock };

  beforeEach(async () => {
    serviceRepository = {
      findServiceById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [GetServiceUseCase, { provide: SERVICE_REPOSITORY, useValue: serviceRepository }],
    }).compile();

    useCase = module.get<GetServiceUseCase>(GetServiceUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return a service by id', async () => {
    const service = { id: 1, name: 'Faxina Regular', isActive: true };

    serviceRepository.findServiceById.mockResolvedValue(service);

    const result = await useCase.getServiceById(1);

    expect(result).toEqual(service);
    expect(serviceRepository.findServiceById).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException if service not found', async () => {
    serviceRepository.findServiceById.mockResolvedValue(null);

    await expect(useCase.getServiceById(999)).rejects.toThrow(NotFoundException);
  });
});
