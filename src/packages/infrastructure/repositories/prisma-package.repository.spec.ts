import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { PrismaPackageRepository } from './prisma-package.repository.js';

describe('PrismaPackageRepository', () => {
  let repository: PrismaPackageRepository;
  let prisma: {
    package: {
      create: Mock;
      findMany: Mock;
      findFirst: Mock;
      update: Mock;
      count: Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      package: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaPackageRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repository = module.get<PrismaPackageRepository>(PrismaPackageRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('createPackage should call prisma.package.create', async () => {
    const data = { name: 'Pacote 10 horas', price: 1200, serviceId: 1 };
    const created = { id: 1, ...data };

    prisma.package.create.mockResolvedValue(created);

    const result = await repository.createPackage(data);

    expect(result).toEqual(created);
    expect(prisma.package.create).toHaveBeenCalledWith({ data });
  });

  it('findPackages should return paginated packages when no filters', async () => {
    const packages = [
      { id: 1, name: 'Pacote 10 horas', isActive: true },
      { id: 2, name: 'Pacote 20 horas', isActive: false },
    ];

    prisma.package.findMany.mockResolvedValue(packages);
    prisma.package.count.mockResolvedValue(2);

    const result = await repository.findPackages({ page: 1, limit: 20 });

    expect(result).toEqual({ data: packages, total: 2, page: 1, limit: 20 });
    expect(prisma.package.findMany).toHaveBeenCalledWith({ where: {}, skip: 0, take: 20 });
    expect(prisma.package.count).toHaveBeenCalledWith({ where: {} });
  });

  it('findPackages should filter by isActive when active is true', async () => {
    const packages = [{ id: 1, name: 'Pacote 10 horas', isActive: true }];

    prisma.package.findMany.mockResolvedValue(packages);
    prisma.package.count.mockResolvedValue(1);

    const result = await repository.findPackages({ page: 1, limit: 20, active: true });

    expect(result).toEqual({ data: packages, total: 1, page: 1, limit: 20 });
    expect(prisma.package.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      skip: 0,
      take: 20,
    });
  });

  it('findPackages should filter by serviceId', async () => {
    const packages = [{ id: 1, name: 'Pacote 10 horas', serviceId: 1 }];

    prisma.package.findMany.mockResolvedValue(packages);
    prisma.package.count.mockResolvedValue(1);

    const result = await repository.findPackages({ page: 1, limit: 20, serviceId: 1 });

    expect(result).toEqual({ data: packages, total: 1, page: 1, limit: 20 });
    expect(prisma.package.findMany).toHaveBeenCalledWith({
      where: { serviceId: 1 },
      skip: 0,
      take: 20,
    });
  });

  it('findPackages should combine active and serviceId filters', async () => {
    const packages = [{ id: 1, name: 'Pacote 10 horas', serviceId: 1, isActive: true }];

    prisma.package.findMany.mockResolvedValue(packages);
    prisma.package.count.mockResolvedValue(1);

    const result = await repository.findPackages({
      page: 1,
      limit: 20,
      active: true,
      serviceId: 1,
    });

    expect(result).toEqual({ data: packages, total: 1, page: 1, limit: 20 });
    expect(prisma.package.findMany).toHaveBeenCalledWith({
      where: { isActive: true, serviceId: 1 },
      skip: 0,
      take: 20,
    });
  });

  it('findPackages should calculate skip for page 2', async () => {
    prisma.package.findMany.mockResolvedValue([]);
    prisma.package.count.mockResolvedValue(25);

    const result = await repository.findPackages({ page: 2, limit: 10 });

    expect(result).toEqual({ data: [], total: 25, page: 2, limit: 10 });
    expect(prisma.package.findMany).toHaveBeenCalledWith({ where: {}, skip: 10, take: 10 });
  });

  it('findPackageById should filter by id and isActive true', async () => {
    const pkg = { id: 1, name: 'Pacote 10 horas', isActive: true };

    prisma.package.findFirst.mockResolvedValue(pkg);

    const result = await repository.findPackageById(1);

    expect(result).toEqual(pkg);
    expect(prisma.package.findFirst).toHaveBeenCalledWith({ where: { id: 1, isActive: true } });
  });

  it('findPackageById should return null when not found', async () => {
    prisma.package.findFirst.mockResolvedValue(null);

    const result = await repository.findPackageById(999);

    expect(result).toBeNull();
  });

  it('findPackageByIdIncludingInactive should find by id without isActive filter', async () => {
    const pkg = { id: 1, name: 'Pacote 10 horas', isActive: false };

    prisma.package.findFirst.mockResolvedValue(pkg);

    const result = await repository.findPackageByIdIncludingInactive(1);

    expect(result).toEqual(pkg);
    expect(prisma.package.findFirst).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('updatePackageById should call prisma.package.update', async () => {
    const data = { name: 'Pacote 20 horas' };
    const updated = { id: 1, name: 'Pacote 20 horas' };

    prisma.package.update.mockResolvedValue(updated);

    const result = await repository.updatePackageById(1, data);

    expect(result).toEqual(updated);
    expect(prisma.package.update).toHaveBeenCalledWith({ where: { id: 1 }, data });
  });

  it('deactivatePackageById should set isActive to false', async () => {
    prisma.package.update.mockResolvedValue({});

    await repository.deactivatePackageById(1);

    expect(prisma.package.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { isActive: false },
    });
  });

  it('reactivatePackageById should set isActive to true', async () => {
    prisma.package.update.mockResolvedValue({});

    await repository.reactivatePackageById(1);

    expect(prisma.package.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { isActive: true },
    });
  });
});
