import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { EMPLOYEE_REPOSITORY } from '../../../domain/interfaces/employee.repository.interface.js';
import type {
  EmployeeSafe,
  IEmployeeRepository,
} from '../../../domain/interfaces/employee.repository.interface.js';
import { CreateEmployeeDto } from '../../../dto/employee/create-employee.dto.js';

@Injectable()
export class CreateEmployeeUseCase {
  constructor(@Inject(EMPLOYEE_REPOSITORY) private employeeRepository: IEmployeeRepository) {}

  async createEmployee(dto: CreateEmployeeDto): Promise<EmployeeSafe> {
    const existingEmail = await this.employeeRepository.findEmployeeByEmail(dto.email);

    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    const existingCpf = await this.employeeRepository.findEmployeeByCpf(dto.cpf);

    if (existingCpf) {
      throw new ConflictException('CPF already in use');
    }

    return this.employeeRepository.createEmployee(dto);
  }
}
