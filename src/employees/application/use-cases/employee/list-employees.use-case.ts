import { Inject, Injectable } from '@nestjs/common';
import { EMPLOYEE_REPOSITORY } from '../../../domain/interfaces/employee.repository.interface.js';
import type {
  EmployeeSafe,
  IEmployeeRepository,
  ListEmployeesFilters,
} from '../../../domain/interfaces/employee.repository.interface.js';

@Injectable()
export class ListEmployeesUseCase {
  constructor(@Inject(EMPLOYEE_REPOSITORY) private employeeRepository: IEmployeeRepository) {}

  async listEmployees(filters: ListEmployeesFilters): Promise<EmployeeSafe[]> {
    return this.employeeRepository.listEmployees(filters);
  }
}
