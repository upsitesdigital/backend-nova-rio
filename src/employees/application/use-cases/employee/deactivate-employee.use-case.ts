import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IEmployeeRepository } from '../../../domain/interfaces/employee.repository.interface.js';

@Injectable()
export class DeactivateEmployeeUseCase {
  constructor(
    @Inject(DiTokens.employeeRepository) private employeeRepository: IEmployeeRepository,
  ) {}

  async deactivateEmployeeById(id: number): Promise<void> {
    const existing = await this.employeeRepository.findEmployeeById(id);

    if (!existing) {
      throw new NotFoundException('Employee not found');
    }

    await this.employeeRepository.deactivateEmployeeById(id);
  }
}
