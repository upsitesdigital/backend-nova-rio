import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { PrismaServiceRepository } from './prisma-service.repository.js';

describe('PrismaServiceRepository', () => {
  let repository: PrismaServiceRepository;
  let prisma: {
    service: {
      create: Mock;
      findMany: Mock;
      findFirst: Mock;
      update: Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      service: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaServiceRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repository = module.get<PrismaServiceRepository>(PrismaServiceRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('createService should call prisma.service.create', async () => {
    const data = { name: 'Faxina Regular', basePrice: 150 };
    const created = { id: 1, ...data };

    prisma.service.create.mockResolvedValue(created);

    const result = await repository.createService(data);

    expect(result).toEqual(created);
    expect(prisma.service.create).toHaveBeenCalledWith({ data });
  });

  it('findAllActiveServices should filter by isActive true', async () => {
    const services = [{ id: 1, name: 'Faxina Regular', isActive: true }];

    prisma.service.findMany.mockResolvedValue(services);

    const result = await repository.findAllActiveServices();

    expect(result).toEqual(services);
    expect(prisma.service.findMany).toHaveBeenCalledWith({ where: { isActive: true } });
  });

  it('findServiceById should filter by id and isActive true', async () => {
    const service = { id: 1, name: 'Faxina Regular', isActive: true };

    prisma.service.findFirst.mockResolvedValue(service);

    const result = await repository.findServiceById(1);

    expect(result).toEqual(service);
    expect(prisma.service.findFirst).toHaveBeenCalledWith({ where: { id: 1, isActive: true } });
  });

  it('findServiceById should return null when not found', async () => {
    prisma.service.findFirst.mockResolvedValue(null);

    const result = await repository.findServiceById(999);

    expect(result).toBeNull();
  });

  it('updateServiceById should call prisma.service.update', async () => {
    const data = { name: 'Faxina Premium' };
    const updated = { id: 1, name: 'Faxina Premium' };

    prisma.service.update.mockResolvedValue(updated);

    const result = await repository.updateServiceById(1, data);

    expect(result).toEqual(updated);
    expect(prisma.service.update).toHaveBeenCalledWith({ where: { id: 1 }, data });
  });

  it('deactivateServiceById should set isActive to false', async () => {
    prisma.service.update.mockResolvedValue({});

    await repository.deactivateServiceById(1);

    expect(prisma.service.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { isActive: false },
    });
  });
});
