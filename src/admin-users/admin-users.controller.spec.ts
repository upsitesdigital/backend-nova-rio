import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import type { AuthUser } from '../shared/types/auth-user.type.js';
import { AdminUsersController } from './admin-users.controller.js';
import { CreateAdminUserUseCase } from './application/use-cases/admin-user/create-admin-user.use-case.js';
import { DeleteAdminUserUseCase } from './application/use-cases/admin-user/delete-admin-user.use-case.js';
import { GetAdminUserUseCase } from './application/use-cases/admin-user/get-admin-user.use-case.js';
import { ListAdminUsersUseCase } from './application/use-cases/admin-user/list-admin-users.use-case.js';

describe('AdminUsersController', () => {
  let controller: AdminUsersController;
  let createAdminUserUseCase: { createAdminUser: Mock };
  let listAdminUsersUseCase: { listAdminUsers: Mock };
  let getAdminUserUseCase: { getAdminUserById: Mock };
  let deleteAdminUserUseCase: { deactivateAdminUserById: Mock };

  const masterUser: AuthUser = {
    id: 1,
    email: 'admin@novario.com',
    type: 'admin',
    role: 'ADMIN_MASTER',
  };
  const basicUser: AuthUser = {
    id: 2,
    email: 'maria@novario.com',
    type: 'admin',
    role: 'ADMIN_BASIC',
  };

  beforeEach(async () => {
    createAdminUserUseCase = { createAdminUser: vi.fn() };
    listAdminUsersUseCase = { listAdminUsers: vi.fn() };
    getAdminUserUseCase = { getAdminUserById: vi.fn() };
    deleteAdminUserUseCase = { deactivateAdminUserById: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUsersController],
      providers: [
        { provide: CreateAdminUserUseCase, useValue: createAdminUserUseCase },
        { provide: ListAdminUsersUseCase, useValue: listAdminUsersUseCase },
        { provide: GetAdminUserUseCase, useValue: getAdminUserUseCase },
        { provide: DeleteAdminUserUseCase, useValue: deleteAdminUserUseCase },
      ],
    }).compile();

    controller = module.get<AdminUsersController>(AdminUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('createAdminUser should call use case with dto, callerId, and callerRole', async () => {
    const dto = { name: 'Maria', email: 'maria@novario.com', password: 'Pass@123' };

    await controller.createAdminUser(dto, masterUser);

    expect(createAdminUserUseCase.createAdminUser).toHaveBeenCalledWith(dto, 1, 'ADMIN_MASTER');
  });

  it('listAdminUsers should call use case with query params', async () => {
    const query = { status: 'ACTIVE' as const };
    const paginated = { data: [], total: 0, page: 1, limit: 20 };
    listAdminUsersUseCase.listAdminUsers.mockResolvedValue(paginated);

    const result = await controller.listAdminUsers(query);

    expect(result).toEqual(paginated);
    expect(listAdminUsersUseCase.listAdminUsers).toHaveBeenCalledWith(query);
  });

  it('getAdminUserById should call use case with id', async () => {
    await controller.getAdminUserById(1);

    expect(getAdminUserUseCase.getAdminUserById).toHaveBeenCalledWith(1);
  });

  it('deactivateAdminUser should call use case with id, callerId, and callerRole', async () => {
    await controller.deactivateAdminUser(2, masterUser);

    expect(deleteAdminUserUseCase.deactivateAdminUserById).toHaveBeenCalledWith(
      2,
      1,
      'ADMIN_MASTER',
    );
  });

  it('deactivateAdminUser should pass ADMIN_BASIC role correctly', async () => {
    await controller.deactivateAdminUser(3, basicUser);

    expect(deleteAdminUserUseCase.deactivateAdminUserById).toHaveBeenCalledWith(
      3,
      2,
      'ADMIN_BASIC',
    );
  });
});
