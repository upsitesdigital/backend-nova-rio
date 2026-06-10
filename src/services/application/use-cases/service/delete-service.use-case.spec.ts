import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { DeleteServiceUseCase } from './delete-service.use-case.js';

describe('DeleteServiceUseCase', () => {
  let useCase: DeleteServiceUseCase;
  let serviceRepository: { findServiceById: Mock; deactivateServiceById: Mock };

  beforeEach(async () => {
    serviceRepository = {
      findServiceById: vi.fn(),
      deactivateServiceById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteServiceUseCase,
        { provide: DiTokens.serviceRepository, useValue: serviceRepository },
      ],
    }).compile();

    useCase = module.get<DeleteServiceUseCase>(DeleteServiceUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should deactivate a service by id', async () => {
    const existing = { id: 1, name: 'Faxina Regular', isActive: true };

    serviceRepository.findServiceById.mockResolvedValue(existing);
    serviceRepository.deactivateServiceById.mockResolvedValue(undefined);

    await useCase.deactivateServiceById(1);

    expect(serviceRepository.findServiceById).toHaveBeenCalledWith(1);
    expect(serviceRepository.deactivateServiceById).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException if service not found', async () => {
    serviceRepository.findServiceById.mockResolvedValue(null);

    await expect(useCase.deactivateServiceById(999)).rejects.toThrow(NotFoundException);
    expect(serviceRepository.deactivateServiceById).not.toHaveBeenCalled();
  });
});
