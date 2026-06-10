import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { PrismaClientManagementRepository } from './prisma-client-management.repository.js';

const CLIENT_SAFE_SELECT = {
  id: true,
  uuid: true,
  name: true,
  email: true,
  phone: true,
  avatarUrl: true,
  company: true,
  cpfCnpj: true,
  address: true,
  complement: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  unit: { select: { id: true, name: true } },
};

describe('PrismaClientManagementRepository', () => {
  let repository: PrismaClientManagementRepository;
  let prisma: {
    client: {
      findMany: Mock;
      findUnique: Mock;
      count: Mock;
      update: Mock;
      updateMany: Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      client: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        count: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaClientManagementRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repository = module.get<PrismaClientManagementRepository>(PrismaClientManagementRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('listClients should call prisma.client.findMany with no filters and default pagination', async () => {
    prisma.client.findMany.mockResolvedValue([]);
    prisma.client.count.mockResolvedValue(0);

    const result = await repository.listClients({});

    expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    expect(prisma.client.findMany).toHaveBeenCalledWith({
      where: {},
      select: CLIENT_SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 20,
    });
  });

  it('listClients should filter by status', async () => {
    prisma.client.findMany.mockResolvedValue([]);
    prisma.client.count.mockResolvedValue(0);

    await repository.listClients({ status: 'PENDING' });

    expect(prisma.client.findMany).toHaveBeenCalledWith({
      where: { status: 'PENDING' },
      select: CLIENT_SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 20,
    });
  });

  it('listClients should filter by search with OR conditions', async () => {
    prisma.client.findMany.mockResolvedValue([]);
    prisma.client.count.mockResolvedValue(0);

    await repository.listClients({ search: 'joao' });

    expect(prisma.client.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { name: { contains: 'joao', mode: 'insensitive' } },
          { email: { contains: 'joao', mode: 'insensitive' } },
          { unit: { name: { contains: 'joao', mode: 'insensitive' } } },
        ],
      },
      select: CLIENT_SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 20,
    });
  });

  it('listClients should combine status and search filters', async () => {
    const clients = [{ id: 1, name: 'Maria' }];
    prisma.client.findMany.mockResolvedValue(clients);
    prisma.client.count.mockResolvedValue(1);

    const result = await repository.listClients({
      status: 'ACTIVE',
      search: 'maria',
      page: 1,
      limit: 20,
    });

    expect(result).toEqual({ data: clients, total: 1, page: 1, limit: 20 });
    expect(prisma.client.findMany).toHaveBeenCalledWith({
      where: {
        status: 'ACTIVE',
        OR: [
          { name: { contains: 'maria', mode: 'insensitive' } },
          { email: { contains: 'maria', mode: 'insensitive' } },
          { unit: { name: { contains: 'maria', mode: 'insensitive' } } },
        ],
      },
      select: CLIENT_SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 20,
    });
  });

  it('listClients should calculate skip based on page and limit', async () => {
    prisma.client.findMany.mockResolvedValue([]);
    prisma.client.count.mockResolvedValue(0);

    await repository.listClients({ page: 3, limit: 10 });

    expect(prisma.client.findMany).toHaveBeenCalledWith({
      where: {},
      select: CLIENT_SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: 20,
      take: 10,
    });
  });

  it('findClientById should call prisma.client.findUnique with id', async () => {
    const client = { id: 1, name: 'João' };
    prisma.client.findUnique.mockResolvedValue(client);

    const result = await repository.findClientById(1);

    expect(result).toEqual(client);
    expect(prisma.client.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: CLIENT_SAFE_SELECT,
    });
  });

  it('findClientById should return null when not found', async () => {
    prisma.client.findUnique.mockResolvedValue(null);

    const result = await repository.findClientById(999);

    expect(result).toBeNull();
  });

  it('approveClientById should set status to ACTIVE', async () => {
    await repository.approveClientById(1);

    expect(prisma.client.updateMany).toHaveBeenCalledWith({
      where: { id: 1, status: 'PENDING' },
      data: { status: 'ACTIVE' },
    });
  });

  it('rejectClientById should set status to INACTIVE', async () => {
    await repository.rejectClientById(1);

    expect(prisma.client.updateMany).toHaveBeenCalledWith({
      where: { id: 1, status: 'PENDING' },
      data: { status: 'INACTIVE' },
    });
  });
});
