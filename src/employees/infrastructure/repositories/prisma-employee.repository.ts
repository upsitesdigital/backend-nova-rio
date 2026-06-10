import { Injectable } from '@nestjs/common';
import { EmployeeStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type { PaginatedResponse } from '../../../shared/types/paginated-response.type.js';
import type {
  CreateEmployeeData,
  EmployeeSafe,
  IEmployeeRepository,
  ListEmployeesFilters,
  UpdateEmployeeData,
} from '../../domain/interfaces/employee.repository.interface.js';
import { EmployeeSelect } from './employee.select.js';

@Injectable()
export class PrismaEmployeeRepository implements IEmployeeRepository {
  constructor(private prisma: PrismaService) {}

  async createEmployee(data: CreateEmployeeData): Promise<EmployeeSafe> {
    return this.prisma.employee.create({
      data,
      select: EmployeeSelect.safe,
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
        select: EmployeeSelect.safe,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.employee.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findEmployeeById(id: number): Promise<EmployeeSafe | null> {
    return this.prisma.employee.findUnique({
      where: { id },
      select: EmployeeSelect.safe,
    });
  }

  async findEmployeeByEmail(email: string): Promise<EmployeeSafe | null> {
    return this.prisma.employee.findUnique({
      where: { email },
      select: EmployeeSelect.safe,
    });
  }

  async findEmployeeByCpf(cpf: string): Promise<EmployeeSafe | null> {
    return this.prisma.employee.findUnique({
      where: { cpf },
      select: EmployeeSelect.safe,
    });
  }

  async updateEmployeeById(id: number, data: UpdateEmployeeData): Promise<EmployeeSafe> {
    return this.prisma.employee.update({
      where: { id },
      data,
      select: EmployeeSelect.safe,
    });
  }

  async deactivateEmployeeById(id: number): Promise<void> {
    await this.prisma.employee.update({
      where: { id },
      data: { status: EmployeeStatus.INACTIVE },
    });
  }
}
