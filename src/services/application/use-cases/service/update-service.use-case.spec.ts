import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { UpdateServiceUseCase } from './update-service.use-case.js';

describe('UpdateServiceUseCase', () => {
  let useCase: UpdateServiceUseCase;
  let serviceRepository: { findServiceById: Mock; updateServiceById: Mock };

  beforeEach(async () => {
    serviceRepository = {
      findServiceById: vi.fn(),
      updateServiceById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateServiceUseCase,
        { provide: DiTokens.serviceRepository, useValue: serviceRepository },
      ],
    }).compile();

    useCase = module.get<UpdateServiceUseCase>(UpdateServiceUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update a service by id', async () => {
    const existing = { id: 1, name: 'Faxina Regular', isActive: true };
    const updated = { ...existing, name: 'Faxina Premium' };
    const dto = { name: 'Faxina Premium' };

    serviceRepository.findServiceById.mockResolvedValue(existing);
    serviceRepository.updateServiceById.mockResolvedValue(updated);

    const result = await useCase.updateServiceById(1, dto);

    expect(result).toEqual(updated);
    expect(serviceRepository.findServiceById).toHaveBeenCalledWith(1);
    expect(serviceRepository.updateServiceById).toHaveBeenCalledWith(1, dto);
  });

  it('should throw NotFoundException if service not found', async () => {
    serviceRepository.findServiceById.mockResolvedValue(null);

    await expect(useCase.updateServiceById(999, { name: 'Test' })).rejects.toThrow(
      NotFoundException,
    );
    expect(serviceRepository.updateServiceById).not.toHaveBeenCalled();
  });
});
