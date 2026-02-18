import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { EMPLOYEE_REPOSITORY } from '../../../domain/interfaces/employee.repository.interface.js';
import { DeactivateEmployeeUseCase } from './deactivate-employee.use-case.js';

describe('DeactivateEmployeeUseCase', () => {
  let useCase: DeactivateEmployeeUseCase;
  let employeeRepository: { findEmployeeById: Mock; deactivateEmployeeById: Mock };

  beforeEach(async () => {
    employeeRepository = {
      findEmployeeById: vi.fn(),
      deactivateEmployeeById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeactivateEmployeeUseCase,
        { provide: EMPLOYEE_REPOSITORY, useValue: employeeRepository },
      ],
    }).compile();

    useCase = module.get<DeactivateEmployeeUseCase>(DeactivateEmployeeUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should deactivate employee when found', async () => {
    employeeRepository.findEmployeeById.mockResolvedValue({ id: 1, name: 'Maria Silva' });
    employeeRepository.deactivateEmployeeById.mockResolvedValue(undefined);

    await useCase.deactivateEmployeeById(1);

    expect(employeeRepository.findEmployeeById).toHaveBeenCalledWith(1);
    expect(employeeRepository.deactivateEmployeeById).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException when employee not found', async () => {
    employeeRepository.findEmployeeById.mockResolvedValue(null);

    await expect(useCase.deactivateEmployeeById(999)).rejects.toThrow(NotFoundException);
    expect(employeeRepository.deactivateEmployeeById).not.toHaveBeenCalled();
  });
});
