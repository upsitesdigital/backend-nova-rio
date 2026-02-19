import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { PACKAGE_REPOSITORY } from '../../../domain/interfaces/package.repository.interface.js';
import { ReactivatePackageUseCase } from './reactivate-package.use-case.js';

describe('ReactivatePackageUseCase', () => {
  let useCase: ReactivatePackageUseCase;
  let packageRepository: { findPackageByIdIncludingInactive: Mock; reactivatePackageById: Mock };

  beforeEach(async () => {
    packageRepository = {
      findPackageByIdIncludingInactive: vi.fn(),
      reactivatePackageById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReactivatePackageUseCase,
        { provide: PACKAGE_REPOSITORY, useValue: packageRepository },
      ],
    }).compile();

    useCase = module.get<ReactivatePackageUseCase>(ReactivatePackageUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should reactivate a package by id', async () => {
    const existing = { id: 1, name: 'Pacote 10 horas', isActive: false };

    packageRepository.findPackageByIdIncludingInactive.mockResolvedValue(existing);
    packageRepository.reactivatePackageById.mockResolvedValue(undefined);

    await useCase.reactivatePackageById(1);

    expect(packageRepository.findPackageByIdIncludingInactive).toHaveBeenCalledWith(1);
    expect(packageRepository.reactivatePackageById).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException if package not found', async () => {
    packageRepository.findPackageByIdIncludingInactive.mockResolvedValue(null);

    await expect(useCase.reactivatePackageById(999)).rejects.toThrow(NotFoundException);
    expect(packageRepository.reactivatePackageById).not.toHaveBeenCalled();
  });
});
