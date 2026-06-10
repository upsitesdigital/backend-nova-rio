import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { UpdatePackageUseCase } from './update-package.use-case.js';

describe('UpdatePackageUseCase', () => {
  let useCase: UpdatePackageUseCase;
  let packageRepository: { findPackageById: Mock; updatePackageById: Mock };
  let serviceRepository: { findServiceById: Mock };

  beforeEach(async () => {
    packageRepository = {
      findPackageById: vi.fn(),
      updatePackageById: vi.fn(),
    };

    serviceRepository = {
      findServiceById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePackageUseCase,
        { provide: DiTokens.packageRepository, useValue: packageRepository },
        { provide: DiTokens.serviceRepository, useValue: serviceRepository },
      ],
    }).compile();

    useCase = module.get<UpdatePackageUseCase>(UpdatePackageUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update a package by id', async () => {
    const existing = { id: 1, name: 'Pacote 10 horas', isActive: true };
    const updated = { ...existing, name: 'Pacote 20 horas' };
    const dto = { name: 'Pacote 20 horas' };

    packageRepository.findPackageById.mockResolvedValue(existing);
    packageRepository.updatePackageById.mockResolvedValue(updated);

    const result = await useCase.updatePackageById(1, dto);

    expect(result).toEqual(updated);
    expect(packageRepository.findPackageById).toHaveBeenCalledWith(1);
    expect(packageRepository.updatePackageById).toHaveBeenCalledWith(1, dto);
  });

  it('should validate serviceId when provided', async () => {
    const existing = { id: 1, name: 'Pacote 10 horas', isActive: true };
    const service = { id: 2, name: 'Faxina Premium', isActive: true };
    const updated = { ...existing, serviceId: 2 };
    const dto = { serviceId: 2 };

    packageRepository.findPackageById.mockResolvedValue(existing);
    serviceRepository.findServiceById.mockResolvedValue(service);
    packageRepository.updatePackageById.mockResolvedValue(updated);

    const result = await useCase.updatePackageById(1, dto);

    expect(result).toEqual(updated);
    expect(serviceRepository.findServiceById).toHaveBeenCalledWith(2);
  });

  it('should throw BadRequestException when serviceId is invalid', async () => {
    const existing = { id: 1, name: 'Pacote 10 horas', isActive: true };
    const dto = { serviceId: 999 };

    packageRepository.findPackageById.mockResolvedValue(existing);
    serviceRepository.findServiceById.mockResolvedValue(null);

    await expect(useCase.updatePackageById(1, dto)).rejects.toThrow(BadRequestException);
    expect(packageRepository.updatePackageById).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if package not found', async () => {
    packageRepository.findPackageById.mockResolvedValue(null);

    await expect(useCase.updatePackageById(999, { name: 'Test' })).rejects.toThrow(
      NotFoundException,
    );
    expect(packageRepository.updatePackageById).not.toHaveBeenCalled();
  });
});
