import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { ADMIN_USER_REPOSITORY } from '../../../domain/interfaces/admin-user.repository.interface.js';
import { DeleteAdminUserUseCase } from './delete-admin-user.use-case.js';

describe('DeleteAdminUserUseCase', () => {
  let useCase: DeleteAdminUserUseCase;
  let adminUserRepository: { findAdminUserById: Mock; deactivateAdminUserById: Mock };

  beforeEach(async () => {
    adminUserRepository = {
      findAdminUserById: vi.fn(),
      deactivateAdminUserById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteAdminUserUseCase,
        { provide: ADMIN_USER_REPOSITORY, useValue: adminUserRepository },
      ],
    }).compile();

    useCase = module.get<DeleteAdminUserUseCase>(DeleteAdminUserUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should deactivate an ADMIN_BASIC user by ADMIN_MASTER', async () => {
    const existing = { id: 2, role: 'ADMIN_BASIC', status: 'ACTIVE' };

    adminUserRepository.findAdminUserById.mockResolvedValue(existing);
    adminUserRepository.deactivateAdminUserById.mockResolvedValue(undefined);

    await useCase.deactivateAdminUserById(2, 1, 'ADMIN_MASTER');

    expect(adminUserRepository.findAdminUserById).toHaveBeenCalledWith(2);
    expect(adminUserRepository.deactivateAdminUserById).toHaveBeenCalledWith(2);
  });

  it('should deactivate an ADMIN_BASIC user by another ADMIN_BASIC', async () => {
    const existing = { id: 3, role: 'ADMIN_BASIC', status: 'ACTIVE' };

    adminUserRepository.findAdminUserById.mockResolvedValue(existing);
    adminUserRepository.deactivateAdminUserById.mockResolvedValue(undefined);

    await useCase.deactivateAdminUserById(3, 2, 'ADMIN_BASIC');

    expect(adminUserRepository.deactivateAdminUserById).toHaveBeenCalledWith(3);
  });

  it('should allow ADMIN_MASTER to deactivate another ADMIN_MASTER', async () => {
    const existing = { id: 3, role: 'ADMIN_MASTER', status: 'ACTIVE' };

    adminUserRepository.findAdminUserById.mockResolvedValue(existing);
    adminUserRepository.deactivateAdminUserById.mockResolvedValue(undefined);

    await useCase.deactivateAdminUserById(3, 1, 'ADMIN_MASTER');

    expect(adminUserRepository.deactivateAdminUserById).toHaveBeenCalledWith(3);
  });

  it('should throw ForbiddenException when trying to self-delete', async () => {
    await expect(useCase.deactivateAdminUserById(1, 1, 'ADMIN_MASTER')).rejects.toThrow(
      ForbiddenException,
    );
    expect(adminUserRepository.findAdminUserById).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when admin user not found', async () => {
    adminUserRepository.findAdminUserById.mockResolvedValue(null);

    await expect(useCase.deactivateAdminUserById(999, 1, 'ADMIN_MASTER')).rejects.toThrow(
      NotFoundException,
    );
    expect(adminUserRepository.deactivateAdminUserById).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when ADMIN_BASIC tries to deactivate ADMIN_MASTER', async () => {
    const existing = { id: 1, role: 'ADMIN_MASTER', status: 'ACTIVE' };

    adminUserRepository.findAdminUserById.mockResolvedValue(existing);

    await expect(useCase.deactivateAdminUserById(1, 2, 'ADMIN_BASIC')).rejects.toThrow(
      ForbiddenException,
    );
    expect(adminUserRepository.deactivateAdminUserById).not.toHaveBeenCalled();
  });
});
