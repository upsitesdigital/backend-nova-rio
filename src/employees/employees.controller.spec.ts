import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { CreateEmployeeUseCase } from './application/use-cases/employee/create-employee.use-case.js';
import { DeactivateEmployeeUseCase } from './application/use-cases/employee/deactivate-employee.use-case.js';
import { GetEmployeeUseCase } from './application/use-cases/employee/get-employee.use-case.js';
import { ListEmployeesUseCase } from './application/use-cases/employee/list-employees.use-case.js';
import { UpdateEmployeeUseCase } from './application/use-cases/employee/update-employee.use-case.js';
import { EmployeesController } from './employees.controller.js';

describe('EmployeesController', () => {
  let controller: EmployeesController;
  let createEmployeeUseCase: { createEmployee: Mock };
  let listEmployeesUseCase: { listEmployees: Mock };
  let getEmployeeUseCase: { getEmployeeById: Mock };
  let updateEmployeeUseCase: { updateEmployeeById: Mock };
  let deactivateEmployeeUseCase: { deactivateEmployeeById: Mock };

  beforeEach(async () => {
    createEmployeeUseCase = { createEmployee: vi.fn() };
    listEmployeesUseCase = { listEmployees: vi.fn() };
    getEmployeeUseCase = { getEmployeeById: vi.fn() };
    updateEmployeeUseCase = { updateEmployeeById: vi.fn() };
    deactivateEmployeeUseCase = { deactivateEmployeeById: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        { provide: CreateEmployeeUseCase, useValue: createEmployeeUseCase },
        { provide: ListEmployeesUseCase, useValue: listEmployeesUseCase },
        { provide: GetEmployeeUseCase, useValue: getEmployeeUseCase },
        { provide: UpdateEmployeeUseCase, useValue: updateEmployeeUseCase },
        { provide: DeactivateEmployeeUseCase, useValue: deactivateEmployeeUseCase },
      ],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('createEmployee should call createEmployeeUseCase', async () => {
    const dto = {
      name: 'Maria Silva',
      email: 'maria@example.com',
      cpf: '987.654.321-00',
      phone: '+5521999998888',
    };
    await controller.createEmployee(dto);
    expect(createEmployeeUseCase.createEmployee).toHaveBeenCalledWith(dto);
  });

  it('listEmployees should call listEmployeesUseCase with query', async () => {
    const query = { status: 'ACTIVE' as const };
    const paginated = { data: [], total: 0, page: 1, limit: 20 };
    listEmployeesUseCase.listEmployees.mockResolvedValue(paginated);

    const result = await controller.listEmployees(query);

    expect(result).toEqual(paginated);
    expect(listEmployeesUseCase.listEmployees).toHaveBeenCalledWith(query);
  });

  it('listEmployees should call listEmployeesUseCase with search', async () => {
    const query = { search: 'maria' };
    const paginated = { data: [], total: 0, page: 1, limit: 20 };
    listEmployeesUseCase.listEmployees.mockResolvedValue(paginated);

    const result = await controller.listEmployees(query);

    expect(result).toEqual(paginated);
    expect(listEmployeesUseCase.listEmployees).toHaveBeenCalledWith(query);
  });

  it('getEmployeeById should call getEmployeeUseCase with id', async () => {
    await controller.getEmployeeById(1);
    expect(getEmployeeUseCase.getEmployeeById).toHaveBeenCalledWith(1);
  });

  it('updateEmployeeById should call updateEmployeeUseCase', async () => {
    const dto = { name: 'Maria Souza' };
    await controller.updateEmployeeById(1, dto);
    expect(updateEmployeeUseCase.updateEmployeeById).toHaveBeenCalledWith(1, dto);
  });

  it('deactivateEmployeeById should call deactivateEmployeeUseCase', async () => {
    await controller.deactivateEmployeeById(1);
    expect(deactivateEmployeeUseCase.deactivateEmployeeById).toHaveBeenCalledWith(1);
  });
});
