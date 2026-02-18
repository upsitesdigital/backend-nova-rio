import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EMPLOYEE_REPOSITORY } from '../../../domain/interfaces/employee.repository.interface.js';
import type {
  EmployeeSafe,
  IEmployeeRepository,
} from '../../../domain/interfaces/employee.repository.interface.js';
import { UpdateEmployeeDto } from '../../../dto/employee/update-employee.dto.js';

@Injectable()
export class UpdateEmployeeUseCase {
  constructor(@Inject(EMPLOYEE_REPOSITORY) private employeeRepository: IEmployeeRepository) {}

  async updateEmployeeById(id: number, dto: UpdateEmployeeDto): Promise<EmployeeSafe> {
    const existing = await this.employeeRepository.findEmployeeById(id);

    if (!existing) {
      throw new NotFoundException('Employee not found');
    }

    if (dto.email && dto.email !== existing.email) {
      const byEmail = await this.employeeRepository.findEmployeeByEmail(dto.email);

      if (byEmail) {
        throw new ConflictException('Email already in use');
      }
    }

    if (dto.cpf && dto.cpf !== existing.cpf) {
      const byCpf = await this.employeeRepository.findEmployeeByCpf(dto.cpf);

      if (byCpf) {
        throw new ConflictException('CPF already in use');
      }
    }

    return this.employeeRepository.updateEmployeeById(id, dto);
  }
}
