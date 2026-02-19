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
    };
  };

  beforeEach(async () => {
    prisma = {
      package: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
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

  it('findPackages should return all packages when no filters', async () => {
    const packages = [
      { id: 1, name: 'Pacote 10 horas', isActive: true },
      { id: 2, name: 'Pacote 20 horas', isActive: false },
    ];

    prisma.package.findMany.mockResolvedValue(packages);

    const result = await repository.findPackages({});

    expect(result).toEqual(packages);
    expect(prisma.package.findMany).toHaveBeenCalledWith({ where: {} });
  });

  it('findPackages should filter by isActive when active is true', async () => {
    const packages = [{ id: 1, name: 'Pacote 10 horas', isActive: true }];

    prisma.package.findMany.mockResolvedValue(packages);

    const result = await repository.findPackages({ active: true });

    expect(result).toEqual(packages);
    expect(prisma.package.findMany).toHaveBeenCalledWith({ where: { isActive: true } });
  });

  it('findPackages should filter by serviceId', async () => {
    const packages = [{ id: 1, name: 'Pacote 10 horas', serviceId: 1 }];

    prisma.package.findMany.mockResolvedValue(packages);

    const result = await repository.findPackages({ serviceId: 1 });

    expect(result).toEqual(packages);
    expect(prisma.package.findMany).toHaveBeenCalledWith({ where: { serviceId: 1 } });
  });

  it('findPackages should combine active and serviceId filters', async () => {
    const packages = [{ id: 1, name: 'Pacote 10 horas', serviceId: 1, isActive: true }];

    prisma.package.findMany.mockResolvedValue(packages);

    const result = await repository.findPackages({ active: true, serviceId: 1 });

    expect(result).toEqual(packages);
    expect(prisma.package.findMany).toHaveBeenCalledWith({
      where: { isActive: true, serviceId: 1 },
    });
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
