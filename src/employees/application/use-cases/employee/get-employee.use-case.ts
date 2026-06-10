import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  EmployeeSafe,
  IEmployeeRepository,
} from '../../../domain/interfaces/employee.repository.interface.js';

@Injectable()
export class GetEmployeeUseCase {
  constructor(
    @Inject(DiTokens.employeeRepository) private employeeRepository: IEmployeeRepository,
  ) {}

  async getEmployeeById(id: number): Promise<EmployeeSafe> {
    const employee = await this.employeeRepository.findEmployeeById(id);

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }
}
