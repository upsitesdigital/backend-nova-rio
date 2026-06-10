import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type {
  EmployeeSafe,
  IEmployeeRepository,
} from '../../../domain/interfaces/employee.repository.interface.js';
import { CreateEmployeeDto } from '../../../dto/employee/create-employee.dto.js';

@Injectable()
export class CreateEmployeeUseCase {
  constructor(
    @Inject(DiTokens.employeeRepository) private employeeRepository: IEmployeeRepository,
  ) {}

  async createEmployee(dto: CreateEmployeeDto): Promise<EmployeeSafe> {
    const [existingByEmail, existingByCpf] = await Promise.all([
      this.employeeRepository.findEmployeeByEmail(dto.email),
      this.employeeRepository.findEmployeeByCpf(dto.cpf),
    ]);

    if (existingByEmail) {
      throw new ConflictException('Email already in use');
    }

    if (existingByCpf) {
      throw new ConflictException('CPF already in use');
    }

    return this.employeeRepository.createEmployee(dto);
  }
}
