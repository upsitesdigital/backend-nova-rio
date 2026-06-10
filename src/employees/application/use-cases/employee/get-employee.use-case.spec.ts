import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { GetEmployeeUseCase } from './get-employee.use-case.js';

describe('GetEmployeeUseCase', () => {
  let useCase: GetEmployeeUseCase;
  let employeeRepository: { findEmployeeById: Mock };

  beforeEach(async () => {
    employeeRepository = {
      findEmployeeById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetEmployeeUseCase,
        { provide: DiTokens.employeeRepository, useValue: employeeRepository },
      ],
    }).compile();

    useCase = module.get<GetEmployeeUseCase>(GetEmployeeUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return employee when found', async () => {
    const employee = { id: 1, name: 'Maria Silva' };
    employeeRepository.findEmployeeById.mockResolvedValue(employee);

    const result = await useCase.getEmployeeById(1);

    expect(result).toEqual(employee);
    expect(employeeRepository.findEmployeeById).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException when employee not found', async () => {
    employeeRepository.findEmployeeById.mockResolvedValue(null);

    await expect(useCase.getEmployeeById(999)).rejects.toThrow(NotFoundException);
  });
});
