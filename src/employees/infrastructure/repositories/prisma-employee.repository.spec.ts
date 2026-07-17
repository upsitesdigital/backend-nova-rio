import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { PrismaEmployeeRepository } from './prisma-employee.repository.js';

const EMPLOYEE_SAFE_SELECT = {
  id: true,
  uuid: true,
  name: true,
  email: true,
  phone: true,
  cpf: true,
  address: true,
  avatarUrl: true,
  status: true,
  availabilityFrom: true,
  availabilityTo: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  unit: { select: { id: true, name: true } },
};

describe('PrismaEmployeeRepository', () => {
  let repository: PrismaEmployeeRepository;
  let prisma: {
    employee: {
      create: Mock;
      findMany: Mock;
      findFirst: Mock;
      findUnique: Mock;
      count: Mock;
      update: Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      employee: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        count: vi.fn(),
        update: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaEmployeeRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repository = module.get<PrismaEmployeeRepository>(PrismaEmployeeRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('createEmployee should call prisma.employee.create with select', async () => {
    const data = {
      name: 'Maria Silva',
      email: 'maria@example.com',
      cpf: '987.654.321-00',
      phone: '+5521999998888',
    };
    const created = { id: 1, ...data };

    prisma.employee.create.mockResolvedValue(created);

    const result = await repository.createEmployee(data);

    expect(result).toEqual(created);
    expect(prisma.employee.create).toHaveBeenCalledWith({ data, select: EMPLOYEE_SAFE_SELECT });
  });

  it('listEmployees should call prisma.employee.findMany with no filters and default pagination', async () => {
    prisma.employee.findMany.mockResolvedValue([]);
    prisma.employee.count.mockResolvedValue(0);

    const result = await repository.listEmployees({ page: 1, limit: 20 });

    expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    expect(prisma.employee.findMany).toHaveBeenCalledWith({
      where: {},
      select: EMPLOYEE_SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 20,
    });
  });

  it('listEmployees should filter by status', async () => {
    prisma.employee.findMany.mockResolvedValue([]);
    prisma.employee.count.mockResolvedValue(0);

    await repository.listEmployees({ page: 1, limit: 20, status: 'ACTIVE' });

    expect(prisma.employee.findMany).toHaveBeenCalledWith({
      where: { status: 'ACTIVE' },
      select: EMPLOYEE_SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 20,
    });
  });

  it('listEmployees should filter by search with OR conditions', async () => {
    prisma.employee.findMany.mockResolvedValue([]);
    prisma.employee.count.mockResolvedValue(0);

    await repository.listEmployees({ page: 1, limit: 20, search: 'maria' });

    expect(prisma.employee.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { name: { contains: 'maria', mode: 'insensitive' } },
          { email: { contains: 'maria', mode: 'insensitive' } },
        ],
      },
      select: EMPLOYEE_SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 20,
    });
  });

  it('listEmployees should combine status and search filters', async () => {
    const employees = [{ id: 1, name: 'Maria Silva' }];
    prisma.employee.findMany.mockResolvedValue(employees);
    prisma.employee.count.mockResolvedValue(1);

    const result = await repository.listEmployees({
      status: 'ACTIVE',
      search: 'maria',
      page: 1,
      limit: 20,
    });

    expect(result).toEqual({ data: employees, total: 1, page: 1, limit: 20 });
    expect(prisma.employee.findMany).toHaveBeenCalledWith({
      where: {
        status: 'ACTIVE',
        OR: [
          { name: { contains: 'maria', mode: 'insensitive' } },
          { email: { contains: 'maria', mode: 'insensitive' } },
        ],
      },
      select: EMPLOYEE_SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 20,
    });
  });

  it('listEmployees should calculate skip based on page and limit', async () => {
    prisma.employee.findMany.mockResolvedValue([]);
    prisma.employee.count.mockResolvedValue(0);

    await repository.listEmployees({ page: 3, limit: 10 });

    expect(prisma.employee.findMany).toHaveBeenCalledWith({
      where: {},
      select: EMPLOYEE_SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: 20,
      take: 10,
    });
  });

  it('findEmployeeById should call prisma.employee.findUnique with id', async () => {
    const employee = { id: 1, name: 'Maria Silva' };
    prisma.employee.findUnique.mockResolvedValue(employee);

    const result = await repository.findEmployeeById(1);

    expect(result).toEqual(employee);
    expect(prisma.employee.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: EMPLOYEE_SAFE_SELECT,
    });
  });

  it('findEmployeeById should return null when not found', async () => {
    prisma.employee.findUnique.mockResolvedValue(null);

    const result = await repository.findEmployeeById(999);

    expect(result).toBeNull();
  });

  it('findEmployeeByEmail should call prisma.employee.findUnique', async () => {
    const employee = { id: 1, email: 'maria@example.com' };
    prisma.employee.findUnique.mockResolvedValue(employee);

    const result = await repository.findEmployeeByEmail('maria@example.com');

    expect(result).toEqual(employee);
    expect(prisma.employee.findUnique).toHaveBeenCalledWith({
      where: { email: 'maria@example.com' },
      select: EMPLOYEE_SAFE_SELECT,
    });
  });

  it('findEmployeeByCpf should call prisma.employee.findUnique', async () => {
    const employee = { id: 1, cpf: '987.654.321-00' };
    prisma.employee.findUnique.mockResolvedValue(employee);

    const result = await repository.findEmployeeByCpf('987.654.321-00');

    expect(result).toEqual(employee);
    expect(prisma.employee.findUnique).toHaveBeenCalledWith({
      where: { cpf: '987.654.321-00' },
      select: EMPLOYEE_SAFE_SELECT,
    });
  });

  it('updateEmployeeById should call prisma.employee.update with select', async () => {
    const data = { name: 'Maria Souza' };
    const updated = { id: 1, name: 'Maria Souza' };

    prisma.employee.update.mockResolvedValue(updated);

    const result = await repository.updateEmployeeById(1, data);

    expect(result).toEqual(updated);
    expect(prisma.employee.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data,
      select: EMPLOYEE_SAFE_SELECT,
    });
  });

  it('deactivateEmployeeById should set status to INACTIVE', async () => {
    prisma.employee.update.mockResolvedValue({});

    await repository.deactivateEmployeeById(1);

    expect(prisma.employee.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: 'INACTIVE' },
    });
  });
});
