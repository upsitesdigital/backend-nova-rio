import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EMPLOYEE_REPOSITORY } from '../../../domain/interfaces/employee.repository.interface.js';
import type {
  EmployeeSafe,
  IEmployeeRepository,
} from '../../../domain/interfaces/employee.repository.interface.js';

@Injectable()
export class GetEmployeeUseCase {
  constructor(@Inject(EMPLOYEE_REPOSITORY) private employeeRepository: IEmployeeRepository) {}

  async getEmployeeById(id: number): Promise<EmployeeSafe> {
    const employee = await this.employeeRepository.findEmployeeById(id);

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }
}
