import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { PACKAGE_REPOSITORY } from '../../../domain/interfaces/package.repository.interface.js';
import { DeletePackageUseCase } from './delete-package.use-case.js';

describe('DeletePackageUseCase', () => {
  let useCase: DeletePackageUseCase;
  let packageRepository: { findPackageById: Mock; deactivatePackageById: Mock };

  beforeEach(async () => {
    packageRepository = {
      findPackageById: vi.fn(),
      deactivatePackageById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletePackageUseCase,
        { provide: PACKAGE_REPOSITORY, useValue: packageRepository },
      ],
    }).compile();

    useCase = module.get<DeletePackageUseCase>(DeletePackageUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should deactivate a package by id', async () => {
    const existing = { id: 1, name: 'Pacote 10 horas', isActive: true };

    packageRepository.findPackageById.mockResolvedValue(existing);
    packageRepository.deactivatePackageById.mockResolvedValue(undefined);

    await useCase.deactivatePackageById(1);

    expect(packageRepository.findPackageById).toHaveBeenCalledWith(1);
    expect(packageRepository.deactivatePackageById).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException if package not found', async () => {
    packageRepository.findPackageById.mockResolvedValue(null);

    await expect(useCase.deactivatePackageById(999)).rejects.toThrow(NotFoundException);
    expect(packageRepository.deactivatePackageById).not.toHaveBeenCalled();
  });
});
