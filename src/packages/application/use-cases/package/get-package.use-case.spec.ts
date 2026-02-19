import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { PACKAGE_REPOSITORY } from '../../../domain/interfaces/package.repository.interface.js';
import { GetPackageUseCase } from './get-package.use-case.js';

describe('GetPackageUseCase', () => {
  let useCase: GetPackageUseCase;
  let packageRepository: { findPackageById: Mock };

  beforeEach(async () => {
    packageRepository = {
      findPackageById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [GetPackageUseCase, { provide: PACKAGE_REPOSITORY, useValue: packageRepository }],
    }).compile();

    useCase = module.get<GetPackageUseCase>(GetPackageUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return a package by id', async () => {
    const pkg = { id: 1, name: 'Pacote 10 horas', isActive: true };

    packageRepository.findPackageById.mockResolvedValue(pkg);

    const result = await useCase.getPackageById(1);

    expect(result).toEqual(pkg);
    expect(packageRepository.findPackageById).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException if package not found', async () => {
    packageRepository.findPackageById.mockResolvedValue(null);

    await expect(useCase.getPackageById(999)).rejects.toThrow(NotFoundException);
  });
});
