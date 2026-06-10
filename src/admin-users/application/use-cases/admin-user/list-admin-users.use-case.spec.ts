import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { ListAdminUsersUseCase } from './list-admin-users.use-case.js';

describe('ListAdminUsersUseCase', () => {
  let useCase: ListAdminUsersUseCase;
  let adminUserRepository: { listAdminUsers: Mock };

  beforeEach(async () => {
    adminUserRepository = { listAdminUsers: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListAdminUsersUseCase,
        { provide: DiTokens.adminUserRepository, useValue: adminUserRepository },
      ],
    }).compile();

    useCase = module.get<ListAdminUsersUseCase>(ListAdminUsersUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should list admin users without filters', async () => {
    const paginated = { data: [{ id: 1, name: 'Admin' }], total: 1, page: 1, limit: 20 };
    adminUserRepository.listAdminUsers.mockResolvedValue(paginated);

    const result = await useCase.listAdminUsers({});

    expect(result).toEqual(paginated);
    expect(adminUserRepository.listAdminUsers).toHaveBeenCalledWith({
      status: undefined,
      search: undefined,
      page: undefined,
      limit: undefined,
    });
  });

  it('should pass status and search filters to repository', async () => {
    const paginated = { data: [], total: 0, page: 1, limit: 20 };
    adminUserRepository.listAdminUsers.mockResolvedValue(paginated);

    await useCase.listAdminUsers({ status: 'ACTIVE', search: 'maria' });

    expect(adminUserRepository.listAdminUsers).toHaveBeenCalledWith({
      status: 'ACTIVE',
      search: 'maria',
      page: undefined,
      limit: undefined,
    });
  });

  it('should pass page and limit to repository', async () => {
    const paginated = { data: [], total: 0, page: 2, limit: 10 };
    adminUserRepository.listAdminUsers.mockResolvedValue(paginated);

    await useCase.listAdminUsers({ page: 2, limit: 10 });

    expect(adminUserRepository.listAdminUsers).toHaveBeenCalledWith({
      status: undefined,
      search: undefined,
      page: 2,
      limit: 10,
    });
  });
});
