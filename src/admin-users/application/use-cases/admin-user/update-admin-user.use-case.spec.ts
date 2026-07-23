import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { UpdateAdminUserUseCase } from './update-admin-user.use-case.js';

describe('UpdateAdminUserUseCase', () => {
  let useCase: UpdateAdminUserUseCase;
  let adminUserRepository: {
    findAdminUserById: Mock;
    findAdminUserByEmail: Mock;
    updateAdminUserById: Mock;
  };
  let hashService: { hash: Mock };

  beforeEach(async () => {
    adminUserRepository = {
      findAdminUserById: vi.fn(),
      findAdminUserByEmail: vi.fn(),
      updateAdminUserById: vi.fn(),
    };
    hashService = { hash: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAdminUserUseCase,
        { provide: DiTokens.adminUserRepository, useValue: adminUserRepository },
        { provide: DiTokens.hashService, useValue: hashService },
      ],
    }).compile();

    useCase = module.get<UpdateAdminUserUseCase>(UpdateAdminUserUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update an ADMIN_BASIC user name', async () => {
    const existing = { id: 2, role: 'ADMIN_BASIC', email: 'maria@novario.com', status: 'ACTIVE' };
    const updated = { ...existing, name: 'Maria Silva' };

    adminUserRepository.findAdminUserById.mockResolvedValue(existing);
    adminUserRepository.updateAdminUserById.mockResolvedValue(updated);

    const result = await useCase.updateAdminUser(2, { name: 'Maria Silva' }, 'ADMIN_BASIC');

    expect(result).toEqual(updated);
    expect(adminUserRepository.updateAdminUserById).toHaveBeenCalledWith(2, {
      name: 'Maria Silva',
    });
  });

  it('should hash the password when provided', async () => {
    const existing = { id: 2, role: 'ADMIN_BASIC', email: 'maria@novario.com', status: 'ACTIVE' };

    adminUserRepository.findAdminUserById.mockResolvedValue(existing);
    hashService.hash.mockResolvedValue('hashed-pass');
    adminUserRepository.updateAdminUserById.mockResolvedValue(existing);

    await useCase.updateAdminUser(2, { password: 'Pass@123' }, 'ADMIN_MASTER');

    expect(hashService.hash).toHaveBeenCalledWith('Pass@123');
    expect(adminUserRepository.updateAdminUserById).toHaveBeenCalledWith(2, {
      password: 'hashed-pass',
    });
  });

  it('should allow ADMIN_MASTER to edit an ADMIN_MASTER', async () => {
    const existing = { id: 3, role: 'ADMIN_MASTER', email: 'joao@novario.com', status: 'ACTIVE' };

    adminUserRepository.findAdminUserById.mockResolvedValue(existing);
    adminUserRepository.updateAdminUserById.mockResolvedValue(existing);

    await useCase.updateAdminUser(3, { name: 'Joao' }, 'ADMIN_MASTER');

    expect(adminUserRepository.updateAdminUserById).toHaveBeenCalledWith(3, { name: 'Joao' });
  });

  it('should throw NotFoundException when admin user not found', async () => {
    adminUserRepository.findAdminUserById.mockResolvedValue(null);

    await expect(useCase.updateAdminUser(999, { name: 'X' }, 'ADMIN_MASTER')).rejects.toThrow(
      NotFoundException,
    );
    expect(adminUserRepository.updateAdminUserById).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when ADMIN_BASIC edits an ADMIN_MASTER', async () => {
    const existing = { id: 1, role: 'ADMIN_MASTER', email: 'admin@novario.com', status: 'ACTIVE' };

    adminUserRepository.findAdminUserById.mockResolvedValue(existing);

    await expect(useCase.updateAdminUser(1, { name: 'X' }, 'ADMIN_BASIC')).rejects.toThrow(
      ForbiddenException,
    );
    expect(adminUserRepository.updateAdminUserById).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when ADMIN_BASIC promotes a user to ADMIN_MASTER', async () => {
    const existing = { id: 2, role: 'ADMIN_BASIC', email: 'maria@novario.com', status: 'ACTIVE' };

    adminUserRepository.findAdminUserById.mockResolvedValue(existing);

    await expect(
      useCase.updateAdminUser(2, { role: 'ADMIN_MASTER' }, 'ADMIN_BASIC'),
    ).rejects.toThrow(ForbiddenException);
    expect(adminUserRepository.updateAdminUserById).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when email is taken by another user', async () => {
    const existing = { id: 2, role: 'ADMIN_BASIC', email: 'maria@novario.com', status: 'ACTIVE' };

    adminUserRepository.findAdminUserById.mockResolvedValue(existing);
    adminUserRepository.findAdminUserByEmail.mockResolvedValue({
      id: 5,
      email: 'taken@novario.com',
    });

    await expect(
      useCase.updateAdminUser(2, { email: 'taken@novario.com' }, 'ADMIN_MASTER'),
    ).rejects.toThrow(ConflictException);
    expect(adminUserRepository.updateAdminUserById).not.toHaveBeenCalled();
  });

  it('should allow keeping the same email without conflict check failure', async () => {
    const existing = { id: 2, role: 'ADMIN_BASIC', email: 'maria@novario.com', status: 'ACTIVE' };

    adminUserRepository.findAdminUserById.mockResolvedValue(existing);
    adminUserRepository.updateAdminUserById.mockResolvedValue(existing);

    await useCase.updateAdminUser(2, { email: 'maria@novario.com' }, 'ADMIN_MASTER');

    expect(adminUserRepository.findAdminUserByEmail).not.toHaveBeenCalled();
    expect(adminUserRepository.updateAdminUserById).toHaveBeenCalledWith(2, {
      email: 'maria@novario.com',
    });
  });
});
