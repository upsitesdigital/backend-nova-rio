import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type { PaginatedResponse } from '../../../shared/types/paginated-response.type.js';
import type {
  CreateEmployeeData,
  EmployeeSafe,
  IEmployeeRepository,
  ListEmployeesFilters,
  UpdateEmployeeData,
} from '../../domain/interfaces/employee.repository.interface.js';

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
} satisfies Prisma.EmployeeSelect;

@Injectable()
export class PrismaEmployeeRepository implements IEmployeeRepository {
  constructor(private prisma: PrismaService) {}

  async createEmployee(data: CreateEmployeeData): Promise<EmployeeSafe> {
    return this.prisma.employee.create({
      data,
      select: EMPLOYEE_SAFE_SELECT,
    });
  }

  async listEmployees(filters: ListEmployeesFilters): Promise<PaginatedResponse<EmployeeSafe>> {
    const where: Prisma.EmployeeWhereInput = {};
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        select: EMPLOYEE_SAFE_SELECT,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.employee.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findEmployeeById(id: number): Promise<EmployeeSafe | null> {
    return this.prisma.employee.findFirst({
      where: { id },
      select: EMPLOYEE_SAFE_SELECT,
    });
  }

  async findEmployeeByEmail(email: string): Promise<EmployeeSafe | null> {
    return this.prisma.employee.findUnique({
      where: { email },
      select: EMPLOYEE_SAFE_SELECT,
    });
  }

  async findEmployeeByCpf(cpf: string): Promise<EmployeeSafe | null> {
    return this.prisma.employee.findUnique({
      where: { cpf },
      select: EMPLOYEE_SAFE_SELECT,
    });
  }

  async updateEmployeeById(id: number, data: UpdateEmployeeData): Promise<EmployeeSafe> {
    return this.prisma.employee.update({
      where: { id },
      data,
      select: EMPLOYEE_SAFE_SELECT,
    });
  }

  async deactivateEmployeeById(id: number): Promise<void> {
    await this.prisma.employee.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }
}
