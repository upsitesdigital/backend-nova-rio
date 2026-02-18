import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { EMPLOYEE_REPOSITORY } from '../../../domain/interfaces/employee.repository.interface.js';
import { ListEmployeesUseCase } from './list-employees.use-case.js';

describe('ListEmployeesUseCase', () => {
  let useCase: ListEmployeesUseCase;
  let employeeRepository: { listEmployees: Mock };

  beforeEach(async () => {
    employeeRepository = {
      listEmployees: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListEmployeesUseCase,
        { provide: EMPLOYEE_REPOSITORY, useValue: employeeRepository },
      ],
    }).compile();

    useCase = module.get<ListEmployeesUseCase>(ListEmployeesUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should call repository.listEmployees with filters', async () => {
    const filters = { status: 'ACTIVE' as const };
    const employees = [{ id: 1, name: 'Maria Silva' }];

    employeeRepository.listEmployees.mockResolvedValue(employees);

    const result = await useCase.listEmployees(filters);

    expect(result).toEqual(employees);
    expect(employeeRepository.listEmployees).toHaveBeenCalledWith(filters);
  });

  it('should call repository.listEmployees with empty filters', async () => {
    employeeRepository.listEmployees.mockResolvedValue([]);

    const result = await useCase.listEmployees({});

    expect(result).toEqual([]);
    expect(employeeRepository.listEmployees).toHaveBeenCalledWith({});
  });
});
