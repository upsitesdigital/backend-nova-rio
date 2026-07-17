import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { PrismaAdminUserRepository } from './prisma-admin-user.repository.js';

const SAFE_SELECT = {
  id: true,
  uuid: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
};

describe('PrismaAdminUserRepository', () => {
  let repository: PrismaAdminUserRepository;
  let prisma: {
    adminUser: {
      create: Mock;
      findUnique: Mock;
      findFirst: Mock;
      findMany: Mock;
      count: Mock;
      update: Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      adminUser: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        update: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaAdminUserRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repository = module.get<PrismaAdminUserRepository>(PrismaAdminUserRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('createAdminUser should call prisma.adminUser.create with select', async () => {
    const data = {
      name: 'Maria',
      email: 'maria@novario.com',
      password: 'hashed',
      role: 'ADMIN_BASIC' as const,
      createdById: 1,
    };
    const created = { id: 2, name: 'Maria', email: 'maria@novario.com', role: 'ADMIN_BASIC' };

    prisma.adminUser.create.mockResolvedValue(created);

    const result = await repository.createAdminUser(data);

    expect(result).toEqual(created);
    expect(prisma.adminUser.create).toHaveBeenCalledWith({ data, select: SAFE_SELECT });
  });

  it('findAdminUserByEmail should call prisma.adminUser.findUnique', async () => {
    const user = { id: 1, email: 'admin@novario.com' };
    prisma.adminUser.findUnique.mockResolvedValue(user);

    const result = await repository.findAdminUserByEmail('admin@novario.com');

    expect(result).toEqual(user);
    expect(prisma.adminUser.findUnique).toHaveBeenCalledWith({
      where: { email: 'admin@novario.com' },
      select: SAFE_SELECT,
    });
  });

  it('findAdminUserById should filter by id and ACTIVE status', async () => {
    const user = { id: 1, name: 'Admin' };
    prisma.adminUser.findFirst.mockResolvedValue(user);

    const result = await repository.findAdminUserById(1);

    expect(result).toEqual(user);
    expect(prisma.adminUser.findFirst).toHaveBeenCalledWith({
      where: { id: 1, status: 'ACTIVE' },
      select: SAFE_SELECT,
    });
  });

  it('findAdminUserById should return null when not found', async () => {
    prisma.adminUser.findFirst.mockResolvedValue(null);

    const result = await repository.findAdminUserById(999);

    expect(result).toBeNull();
  });

  it('listAdminUsers should call prisma.adminUser.findMany with filters and pagination', async () => {
    const users = [{ id: 1, name: 'Maria' }];
    prisma.adminUser.findMany.mockResolvedValue(users);
    prisma.adminUser.count.mockResolvedValue(1);

    const result = await repository.listAdminUsers({
      status: 'ACTIVE',
      search: 'maria',
      page: 1,
      limit: 20,
    });

    expect(result).toEqual({ data: users, total: 1, page: 1, limit: 20 });
    expect(prisma.adminUser.findMany).toHaveBeenCalledWith({
      where: {
        status: 'ACTIVE',
        OR: [
          { name: { contains: 'maria', mode: 'insensitive' } },
          { email: { contains: 'maria', mode: 'insensitive' } },
        ],
      },
      select: SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 20,
    });
    expect(prisma.adminUser.count).toHaveBeenCalledWith({
      where: {
        status: 'ACTIVE',
        OR: [
          { name: { contains: 'maria', mode: 'insensitive' } },
          { email: { contains: 'maria', mode: 'insensitive' } },
        ],
      },
    });
  });

  it('listAdminUsers should not add OR when search is empty', async () => {
    prisma.adminUser.findMany.mockResolvedValue([]);
    prisma.adminUser.count.mockResolvedValue(0);

    const result = await repository.listAdminUsers({ page: 1, limit: 20 });

    expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    expect(prisma.adminUser.findMany).toHaveBeenCalledWith({
      where: {},
      select: SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 20,
    });
  });

  it('listAdminUsers should calculate skip based on page and limit', async () => {
    prisma.adminUser.findMany.mockResolvedValue([]);
    prisma.adminUser.count.mockResolvedValue(0);

    await repository.listAdminUsers({ page: 3, limit: 10 });

    expect(prisma.adminUser.findMany).toHaveBeenCalledWith({
      where: {},
      select: SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: 20,
      take: 10,
    });
  });

  it('deactivateAdminUserById should set status to INACTIVE', async () => {
    prisma.adminUser.update.mockResolvedValue({});

    await repository.deactivateAdminUserById(1);

    expect(prisma.adminUser.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: 'INACTIVE' },
    });
  });
});
