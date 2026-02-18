import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { ADMIN_USER_REPOSITORY } from '../../../domain/interfaces/admin-user.repository.interface.js';
import { ListAdminUsersUseCase } from './list-admin-users.use-case.js';

describe('ListAdminUsersUseCase', () => {
  let useCase: ListAdminUsersUseCase;
  let adminUserRepository: { listAdminUsers: Mock };

  beforeEach(async () => {
    adminUserRepository = { listAdminUsers: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListAdminUsersUseCase,
        { provide: ADMIN_USER_REPOSITORY, useValue: adminUserRepository },
      ],
    }).compile();

    useCase = module.get<ListAdminUsersUseCase>(ListAdminUsersUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should list admin users without filters', async () => {
    const users = [{ id: 1, name: 'Admin' }];
    adminUserRepository.listAdminUsers.mockResolvedValue(users);

    const result = await useCase.listAdminUsers({});

    expect(result).toEqual(users);
    expect(adminUserRepository.listAdminUsers).toHaveBeenCalledWith({
      status: undefined,
      search: undefined,
    });
  });

  it('should pass status and search filters to repository', async () => {
    adminUserRepository.listAdminUsers.mockResolvedValue([]);

    await useCase.listAdminUsers({ status: 'ACTIVE', search: 'maria' });

    expect(adminUserRepository.listAdminUsers).toHaveBeenCalledWith({
      status: 'ACTIVE',
      search: 'maria',
    });
  });
});
