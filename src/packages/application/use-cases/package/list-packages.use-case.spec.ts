import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { SERVICE_REPOSITORY } from '../../../../services/domain/interfaces/service.repository.interface.js';
import { PACKAGE_REPOSITORY } from '../../../domain/interfaces/package.repository.interface.js';
import { ListPackagesUseCase } from './list-packages.use-case.js';

describe('ListPackagesUseCase', () => {
  let useCase: ListPackagesUseCase;
  let packageRepository: { findPackages: Mock };
  let serviceRepository: { findServiceById: Mock };

  beforeEach(async () => {
    packageRepository = {
      findPackages: vi.fn(),
    };

    serviceRepository = {
      findServiceById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListPackagesUseCase,
        { provide: PACKAGE_REPOSITORY, useValue: packageRepository },
        { provide: SERVICE_REPOSITORY, useValue: serviceRepository },
      ],
    }).compile();

    useCase = module.get<ListPackagesUseCase>(ListPackagesUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return all packages when no filters', async () => {
    const packages = [
      { id: 1, name: 'Pacote 10 horas', isActive: true },
      { id: 2, name: 'Pacote 20 horas', isActive: false },
    ];

    packageRepository.findPackages.mockResolvedValue(packages);

    const result = await useCase.listPackages();

    expect(result).toEqual(packages);
    expect(packageRepository.findPackages).toHaveBeenCalledWith({
      active: undefined,
      serviceId: undefined,
    });
  });

  it('should return only active packages when active is true', async () => {
    const packages = [{ id: 1, name: 'Pacote 10 horas', isActive: true }];

    packageRepository.findPackages.mockResolvedValue(packages);

    const result = await useCase.listPackages(true);

    expect(result).toEqual(packages);
    expect(packageRepository.findPackages).toHaveBeenCalledWith({
      active: true,
      serviceId: undefined,
    });
  });

  it('should filter by serviceId when provided', async () => {
    const service = { id: 1, name: 'Faxina Regular', isActive: true };
    const packages = [{ id: 1, name: 'Pacote 10 horas', serviceId: 1 }];

    serviceRepository.findServiceById.mockResolvedValue(service);
    packageRepository.findPackages.mockResolvedValue(packages);

    const result = await useCase.listPackages(undefined, 1);

    expect(result).toEqual(packages);
    expect(serviceRepository.findServiceById).toHaveBeenCalledWith(1);
    expect(packageRepository.findPackages).toHaveBeenCalledWith({
      active: undefined,
      serviceId: 1,
    });
  });

  it('should combine active and serviceId filters', async () => {
    const service = { id: 1, name: 'Faxina Regular', isActive: true };
    const packages = [{ id: 1, name: 'Pacote 10 horas', serviceId: 1, isActive: true }];

    serviceRepository.findServiceById.mockResolvedValue(service);
    packageRepository.findPackages.mockResolvedValue(packages);

    const result = await useCase.listPackages(true, 1);

    expect(result).toEqual(packages);
    expect(packageRepository.findPackages).toHaveBeenCalledWith({
      active: true,
      serviceId: 1,
    });
  });

  it('should throw BadRequestException when serviceId is invalid', async () => {
    serviceRepository.findServiceById.mockResolvedValue(null);

    await expect(useCase.listPackages(undefined, 999)).rejects.toThrow(BadRequestException);
    expect(packageRepository.findPackages).not.toHaveBeenCalled();
  });

  it('should return empty array when no packages', async () => {
    packageRepository.findPackages.mockResolvedValue([]);

    const result = await useCase.listPackages();

    expect(result).toEqual([]);
  });
});
