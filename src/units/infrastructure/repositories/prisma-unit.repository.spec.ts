import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { PrismaUnitRepository } from './prisma-unit.repository.js';

describe('PrismaUnitRepository', () => {
  let repository: PrismaUnitRepository;
  let prisma: {
    unit: {
      create: Mock;
      findMany: Mock;
      findUnique: Mock;
      update: Mock;
      delete: Mock;
      count: Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      unit: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaUnitRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repository = module.get<PrismaUnitRepository>(PrismaUnitRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('createUnit should call prisma.unit.create', async () => {
    const data = { name: 'Unidade Centro' };
    const created = { id: 1, ...data };

    prisma.unit.create.mockResolvedValue(created);

    const result = await repository.createUnit(data);

    expect(result).toEqual(created);
    expect(prisma.unit.create).toHaveBeenCalledWith({ data });
  });

  it('listUnits should return paginated units ordered by name', async () => {
    const units = [{ id: 1, name: 'Unidade Centro' }];

    prisma.unit.findMany.mockResolvedValue(units);
    prisma.unit.count.mockResolvedValue(1);

    const result = await repository.listUnits({ page: 1, limit: 20 });

    expect(result).toEqual({ data: units, total: 1, page: 1, limit: 20 });
    expect(prisma.unit.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
      skip: 0,
      take: 20,
    });
    expect(prisma.unit.count).toHaveBeenCalled();
  });

  it('listUnits should calculate skip for page 2', async () => {
    prisma.unit.findMany.mockResolvedValue([]);
    prisma.unit.count.mockResolvedValue(25);

    const result = await repository.listUnits({ page: 2, limit: 20 });

    expect(result).toEqual({ data: [], total: 25, page: 2, limit: 20 });
    expect(prisma.unit.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
      skip: 20,
      take: 20,
    });
  });

  it('findUnitById should call prisma.unit.findUnique with id', async () => {
    const unit = { id: 1, name: 'Unidade Centro' };

    prisma.unit.findUnique.mockResolvedValue(unit);

    const result = await repository.findUnitById(1);

    expect(result).toEqual(unit);
    expect(prisma.unit.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('findUnitById should return null when not found', async () => {
    prisma.unit.findUnique.mockResolvedValue(null);

    const result = await repository.findUnitById(999);

    expect(result).toBeNull();
  });

  it('findUnitByName should call prisma.unit.findUnique with name', async () => {
    const unit = { id: 1, name: 'Unidade Centro' };

    prisma.unit.findUnique.mockResolvedValue(unit);

    const result = await repository.findUnitByName('Unidade Centro');

    expect(result).toEqual(unit);
    expect(prisma.unit.findUnique).toHaveBeenCalledWith({ where: { name: 'Unidade Centro' } });
  });

  it('updateUnitById should call prisma.unit.update', async () => {
    const data = { name: 'Unidade Norte' };
    const updated = { id: 1, name: 'Unidade Norte' };

    prisma.unit.update.mockResolvedValue(updated);

    const result = await repository.updateUnitById(1, data);

    expect(result).toEqual(updated);
    expect(prisma.unit.update).toHaveBeenCalledWith({ where: { id: 1 }, data });
  });

  it('deleteUnitById should call prisma.unit.delete', async () => {
    prisma.unit.delete.mockResolvedValue({});

    await repository.deleteUnitById(1);

    expect(prisma.unit.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
