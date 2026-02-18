import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { ADMIN_USER_REPOSITORY } from '../../../domain/interfaces/admin-user.repository.interface.js';
import { GetAdminUserUseCase } from './get-admin-user.use-case.js';

describe('GetAdminUserUseCase', () => {
  let useCase: GetAdminUserUseCase;
  let adminUserRepository: { findAdminUserById: Mock };

  beforeEach(async () => {
    adminUserRepository = { findAdminUserById: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAdminUserUseCase,
        { provide: ADMIN_USER_REPOSITORY, useValue: adminUserRepository },
      ],
    }).compile();

    useCase = module.get<GetAdminUserUseCase>(GetAdminUserUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return an admin user by id', async () => {
    const user = { id: 1, name: 'Admin', role: 'ADMIN_MASTER' };
    adminUserRepository.findAdminUserById.mockResolvedValue(user);

    const result = await useCase.getAdminUserById(1);

    expect(result).toEqual(user);
    expect(adminUserRepository.findAdminUserById).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException when admin user not found', async () => {
    adminUserRepository.findAdminUserById.mockResolvedValue(null);

    await expect(useCase.getAdminUserById(999)).rejects.toThrow(NotFoundException);
  });
});
