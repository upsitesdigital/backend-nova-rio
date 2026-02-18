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

  it('listAdminUsers should call prisma.adminUser.findMany with filters', async () => {
    prisma.adminUser.findMany.mockResolvedValue([]);

    await repository.listAdminUsers({ status: 'ACTIVE', search: 'maria' });

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
    });
  });

  it('listAdminUsers should not add OR when search is empty', async () => {
    prisma.adminUser.findMany.mockResolvedValue([]);

    await repository.listAdminUsers({});

    expect(prisma.adminUser.findMany).toHaveBeenCalledWith({
      where: {},
      select: SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
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
