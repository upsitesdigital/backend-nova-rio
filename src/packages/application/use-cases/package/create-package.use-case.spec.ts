import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { SERVICE_REPOSITORY } from '../../../../services/domain/interfaces/service.repository.interface.js';
import { PACKAGE_REPOSITORY } from '../../../domain/interfaces/package.repository.interface.js';
import { CreatePackageUseCase } from './create-package.use-case.js';

describe('CreatePackageUseCase', () => {
  let useCase: CreatePackageUseCase;
  let packageRepository: { createPackage: Mock };
  let serviceRepository: { findServiceById: Mock };

  beforeEach(async () => {
    packageRepository = {
      createPackage: vi.fn(),
    };

    serviceRepository = {
      findServiceById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePackageUseCase,
        { provide: PACKAGE_REPOSITORY, useValue: packageRepository },
        { provide: SERVICE_REPOSITORY, useValue: serviceRepository },
      ],
    }).compile();

    useCase = module.get<CreatePackageUseCase>(CreatePackageUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a package when service exists', async () => {
    const dto = { name: 'Pacote 10 horas', price: 1200, serviceId: 1 };
    const service = { id: 1, name: 'Faxina Regular', isActive: true };
    const created = {
      id: 1,
      uuid: 'uuid-123',
      name: 'Pacote 10 horas',
      description: null,
      totalHours: null,
      price: '1200.00',
      isActive: true,
      serviceId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    serviceRepository.findServiceById.mockResolvedValue(service);
    packageRepository.createPackage.mockResolvedValue(created);

    const result = await useCase.createPackage(dto);

    expect(result).toEqual(created);
    expect(serviceRepository.findServiceById).toHaveBeenCalledWith(1);
    expect(packageRepository.createPackage).toHaveBeenCalledWith(dto);
  });

  it('should throw BadRequestException when service not found', async () => {
    const dto = { name: 'Pacote 10 horas', price: 1200, serviceId: 999 };

    serviceRepository.findServiceById.mockResolvedValue(null);

    await expect(useCase.createPackage(dto)).rejects.toThrow(BadRequestException);
    expect(packageRepository.createPackage).not.toHaveBeenCalled();
  });
});
