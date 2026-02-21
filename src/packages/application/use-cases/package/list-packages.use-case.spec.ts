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

  it('should return paginated packages when no filters', async () => {
    const paginatedResult = {
      data: [
        { id: 1, name: 'Pacote 10 horas', isActive: true },
        { id: 2, name: 'Pacote 20 horas', isActive: false },
      ],
      total: 2,
      page: 1,
      limit: 20,
    };

    packageRepository.findPackages.mockResolvedValue(paginatedResult);

    const result = await useCase.listPackages({ page: 1, limit: 20 });

    expect(result).toEqual(paginatedResult);
    expect(packageRepository.findPackages).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      active: undefined,
      serviceId: undefined,
    });
  });

  it('should return only active packages when active is true', async () => {
    const paginatedResult = {
      data: [{ id: 1, name: 'Pacote 10 horas', isActive: true }],
      total: 1,
      page: 1,
      limit: 20,
    };

    packageRepository.findPackages.mockResolvedValue(paginatedResult);

    const result = await useCase.listPackages({ page: 1, limit: 20, active: true });

    expect(result).toEqual(paginatedResult);
    expect(packageRepository.findPackages).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      active: true,
      serviceId: undefined,
    });
  });

  it('should filter by serviceId when provided', async () => {
    const service = { id: 1, name: 'Faxina Regular', isActive: true };
    const paginatedResult = {
      data: [{ id: 1, name: 'Pacote 10 horas', serviceId: 1 }],
      total: 1,
      page: 1,
      limit: 20,
    };

    serviceRepository.findServiceById.mockResolvedValue(service);
    packageRepository.findPackages.mockResolvedValue(paginatedResult);

    const result = await useCase.listPackages({ page: 1, limit: 20, serviceId: 1 });

    expect(result).toEqual(paginatedResult);
    expect(serviceRepository.findServiceById).toHaveBeenCalledWith(1);
    expect(packageRepository.findPackages).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      active: undefined,
      serviceId: 1,
    });
  });

  it('should combine active and serviceId filters', async () => {
    const service = { id: 1, name: 'Faxina Regular', isActive: true };
    const paginatedResult = {
      data: [{ id: 1, name: 'Pacote 10 horas', serviceId: 1, isActive: true }],
      total: 1,
      page: 1,
      limit: 20,
    };

    serviceRepository.findServiceById.mockResolvedValue(service);
    packageRepository.findPackages.mockResolvedValue(paginatedResult);

    const result = await useCase.listPackages({ page: 1, limit: 20, active: true, serviceId: 1 });

    expect(result).toEqual(paginatedResult);
    expect(packageRepository.findPackages).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      active: true,
      serviceId: 1,
    });
  });

  it('should throw BadRequestException when serviceId is invalid', async () => {
    serviceRepository.findServiceById.mockResolvedValue(null);

    await expect(useCase.listPackages({ page: 1, limit: 20, serviceId: 999 })).rejects.toThrow(
      BadRequestException,
    );
    expect(packageRepository.findPackages).not.toHaveBeenCalled();
  });

  it('should return empty data when no packages', async () => {
    const paginatedResult = { data: [], total: 0, page: 1, limit: 20 };

    packageRepository.findPackages.mockResolvedValue(paginatedResult);

    const result = await useCase.listPackages({ page: 1, limit: 20 });

    expect(result).toEqual(paginatedResult);
  });
});
