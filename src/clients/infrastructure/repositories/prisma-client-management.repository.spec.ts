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
      findFirst: Mock;
      update: Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      client: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
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

  it('listClients should call prisma.client.findMany with no filters', async () => {
    prisma.client.findMany.mockResolvedValue([]);

    await repository.listClients({});

    expect(prisma.client.findMany).toHaveBeenCalledWith({
      where: {},
      select: CLIENT_SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  });

  it('listClients should filter by status', async () => {
    prisma.client.findMany.mockResolvedValue([]);

    await repository.listClients({ status: 'PENDING' });

    expect(prisma.client.findMany).toHaveBeenCalledWith({
      where: { status: 'PENDING' },
      select: CLIENT_SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  });

  it('listClients should filter by search with OR conditions', async () => {
    prisma.client.findMany.mockResolvedValue([]);

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
    });
  });

  it('listClients should combine status and search filters', async () => {
    prisma.client.findMany.mockResolvedValue([]);

    await repository.listClients({ status: 'ACTIVE', search: 'maria' });

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
    });
  });

  it('findClientById should call prisma.client.findFirst with id', async () => {
    const client = { id: 1, name: 'João' };
    prisma.client.findFirst.mockResolvedValue(client);

    const result = await repository.findClientById(1);

    expect(result).toEqual(client);
    expect(prisma.client.findFirst).toHaveBeenCalledWith({
      where: { id: 1 },
      select: CLIENT_SAFE_SELECT,
    });
  });

  it('findClientById should return null when not found', async () => {
    prisma.client.findFirst.mockResolvedValue(null);

    const result = await repository.findClientById(999);

    expect(result).toBeNull();
  });

  it('approveClientById should set status to ACTIVE', async () => {
    prisma.client.update.mockResolvedValue({});

    await repository.approveClientById(1);

    expect(prisma.client.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: 'ACTIVE' },
    });
  });

  it('rejectClientById should set status to INACTIVE', async () => {
    prisma.client.update.mockResolvedValue({});

    await repository.rejectClientById(1);

    expect(prisma.client.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: 'INACTIVE' },
    });
  });
});
