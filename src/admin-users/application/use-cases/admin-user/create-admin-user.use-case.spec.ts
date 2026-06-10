import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { CreateAdminUserUseCase } from './create-admin-user.use-case.js';

describe('CreateAdminUserUseCase', () => {
  let useCase: CreateAdminUserUseCase;
  let adminUserRepository: { createAdminUser: Mock; findAdminUserByEmail: Mock };
  let hashService: { hash: Mock };

  beforeEach(async () => {
    adminUserRepository = {
      createAdminUser: vi.fn(),
      findAdminUserByEmail: vi.fn(),
    };
    hashService = { hash: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAdminUserUseCase,
        { provide: DiTokens.adminUserRepository, useValue: adminUserRepository },
        { provide: DiTokens.hashService, useValue: hashService },
      ],
    }).compile();

    useCase = module.get<CreateAdminUserUseCase>(CreateAdminUserUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create an ADMIN_BASIC user', async () => {
    const dto = { name: 'Maria', email: 'maria@novario.com', password: 'Pass@123' };
    const created = {
      id: 2,
      uuid: 'uuid-123',
      name: 'Maria',
      email: 'maria@novario.com',
      role: 'ADMIN_BASIC',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: 1,
    };

    adminUserRepository.findAdminUserByEmail.mockResolvedValue(null);
    hashService.hash.mockResolvedValue('hashed-password');
    adminUserRepository.createAdminUser.mockResolvedValue(created);

    const result = await useCase.createAdminUser(dto, 1, 'ADMIN_MASTER');

    expect(result).toEqual(created);
    expect(hashService.hash).toHaveBeenCalledWith('Pass@123');
    expect(adminUserRepository.createAdminUser).toHaveBeenCalledWith({
      name: 'Maria',
      email: 'maria@novario.com',
      password: 'hashed-password',
      role: 'ADMIN_BASIC',
      createdById: 1,
    });
  });

  it('should allow ADMIN_MASTER to create another ADMIN_MASTER', async () => {
    const dto = {
      name: 'Carlos',
      email: 'carlos@novario.com',
      password: 'Pass@123',
      role: 'ADMIN_MASTER' as const,
    };

    adminUserRepository.findAdminUserByEmail.mockResolvedValue(null);
    hashService.hash.mockResolvedValue('hashed');
    adminUserRepository.createAdminUser.mockResolvedValue({ id: 3 });

    await useCase.createAdminUser(dto, 1, 'ADMIN_MASTER');

    expect(adminUserRepository.createAdminUser).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'ADMIN_MASTER' }),
    );
  });

  it('should throw ForbiddenException when ADMIN_BASIC tries to create ADMIN_MASTER', async () => {
    const dto = {
      name: 'Hack',
      email: 'hack@novario.com',
      password: 'Pass@123',
      role: 'ADMIN_MASTER' as const,
    };

    await expect(useCase.createAdminUser(dto, 2, 'ADMIN_BASIC')).rejects.toThrow(
      ForbiddenException,
    );
    expect(adminUserRepository.findAdminUserByEmail).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when email already exists', async () => {
    const dto = { name: 'Dup', email: 'existing@novario.com', password: 'Pass@123' };

    adminUserRepository.findAdminUserByEmail.mockResolvedValue({
      id: 1,
      email: 'existing@novario.com',
    });

    await expect(useCase.createAdminUser(dto, 1, 'ADMIN_MASTER')).rejects.toThrow(
      ConflictException,
    );
    expect(adminUserRepository.createAdminUser).not.toHaveBeenCalled();
  });

  it('should default role to ADMIN_BASIC when not provided', async () => {
    const dto = { name: 'Default', email: 'default@novario.com', password: 'Pass@123' };

    adminUserRepository.findAdminUserByEmail.mockResolvedValue(null);
    hashService.hash.mockResolvedValue('hashed');
    adminUserRepository.createAdminUser.mockResolvedValue({ id: 4 });

    await useCase.createAdminUser(dto, 1, 'ADMIN_BASIC');

    expect(adminUserRepository.createAdminUser).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'ADMIN_BASIC' }),
    );
  });
});
