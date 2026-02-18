import type { EmployeeStatus } from '@prisma/client';

export const EMPLOYEE_REPOSITORY = Symbol('EMPLOYEE_REPOSITORY');

export interface EmployeeSafe {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone: string | null;
  cpf: string;
  address: string | null;
  avatarUrl: string | null;
  status: EmployeeStatus;
  availabilityFrom: string | null;
  availabilityTo: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  unit: { id: number; name: string } | null;
}

export interface CreateEmployeeData {
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  availabilityFrom?: string;
  availabilityTo?: string;
  notes?: string;
  unitId?: number;
}

export interface UpdateEmployeeData {
  name?: string;
  email?: string;
  cpf?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  availabilityFrom?: string;
  availabilityTo?: string;
  notes?: string;
  unitId?: number;
}

export interface ListEmployeesFilters {
  status?: EmployeeStatus;
  search?: string;
}

export interface IEmployeeRepository {
  createEmployee(data: CreateEmployeeData): Promise<EmployeeSafe>;
  listEmployees(filters: ListEmployeesFilters): Promise<EmployeeSafe[]>;
  findEmployeeById(id: number): Promise<EmployeeSafe | null>;
  findEmployeeByEmail(email: string): Promise<EmployeeSafe | null>;
  findEmployeeByCpf(cpf: string): Promise<EmployeeSafe | null>;
  updateEmployeeById(id: number, data: UpdateEmployeeData): Promise<EmployeeSafe>;
  deactivateEmployeeById(id: number): Promise<void>;
}
