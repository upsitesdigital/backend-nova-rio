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
    const query = { status: 'ACTIVE' as const };
    const paginated = { data: [{ id: 1, name: 'Maria Silva' }], total: 1, page: 1, limit: 20 };

    employeeRepository.listEmployees.mockResolvedValue(paginated);

    const result = await useCase.listEmployees(query);

    expect(result).toEqual(paginated);
    expect(employeeRepository.listEmployees).toHaveBeenCalledWith({
      status: 'ACTIVE',
      search: undefined,
      page: undefined,
      limit: undefined,
    });
  });

  it('should call repository.listEmployees with empty filters', async () => {
    const paginated = { data: [], total: 0, page: 1, limit: 20 };
    employeeRepository.listEmployees.mockResolvedValue(paginated);

    const result = await useCase.listEmployees({});

    expect(result).toEqual(paginated);
    expect(employeeRepository.listEmployees).toHaveBeenCalledWith({
      status: undefined,
      search: undefined,
      page: undefined,
      limit: undefined,
    });
  });

  it('should pass page and limit to repository', async () => {
    const paginated = { data: [], total: 0, page: 2, limit: 10 };
    employeeRepository.listEmployees.mockResolvedValue(paginated);

    const result = await useCase.listEmployees({ page: 2, limit: 10 });

    expect(result).toEqual(paginated);
    expect(employeeRepository.listEmployees).toHaveBeenCalledWith({
      status: undefined,
      search: undefined,
      page: 2,
      limit: 10,
    });
  });
});
