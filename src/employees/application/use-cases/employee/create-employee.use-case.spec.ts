import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { CreateEmployeeUseCase } from './create-employee.use-case.js';

describe('CreateEmployeeUseCase', () => {
  let useCase: CreateEmployeeUseCase;
  let employeeRepository: {
    createEmployee: Mock;
    findEmployeeByEmail: Mock;
    findEmployeeByCpf: Mock;
  };

  beforeEach(async () => {
    employeeRepository = {
      createEmployee: vi.fn(),
      findEmployeeByEmail: vi.fn(),
      findEmployeeByCpf: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateEmployeeUseCase,
        { provide: DiTokens.employeeRepository, useValue: employeeRepository },
      ],
    }).compile();

    useCase = module.get<CreateEmployeeUseCase>(CreateEmployeeUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create employee when email and cpf are unique', async () => {
    const dto = {
      name: 'Maria Silva',
      email: 'maria@example.com',
      cpf: '987.654.321-00',
      phone: '+5521999998888',
    };
    const created = { id: 1, ...dto, uuid: 'uuid-1', status: 'ACTIVE' };

    employeeRepository.findEmployeeByEmail.mockResolvedValue(null);
    employeeRepository.findEmployeeByCpf.mockResolvedValue(null);
    employeeRepository.createEmployee.mockResolvedValue(created);

    const result = await useCase.createEmployee(dto);

    expect(result).toEqual(created);
    expect(employeeRepository.findEmployeeByEmail).toHaveBeenCalledWith('maria@example.com');
    expect(employeeRepository.findEmployeeByCpf).toHaveBeenCalledWith('987.654.321-00');
    expect(employeeRepository.createEmployee).toHaveBeenCalledWith(dto);
  });

  it('should throw ConflictException when email already exists', async () => {
    const dto = {
      name: 'Maria Silva',
      email: 'maria@example.com',
      cpf: '987.654.321-00',
      phone: '+5521999998888',
    };

    employeeRepository.findEmployeeByEmail.mockResolvedValue({ id: 2, email: 'maria@example.com' });
    employeeRepository.findEmployeeByCpf.mockResolvedValue(null);

    await expect(useCase.createEmployee(dto)).rejects.toThrow(ConflictException);
    expect(employeeRepository.createEmployee).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when cpf already exists', async () => {
    const dto = {
      name: 'Maria Silva',
      email: 'maria@example.com',
      cpf: '987.654.321-00',
      phone: '+5521999998888',
    };

    employeeRepository.findEmployeeByEmail.mockResolvedValue(null);
    employeeRepository.findEmployeeByCpf.mockResolvedValue({ id: 2, cpf: '987.654.321-00' });

    await expect(useCase.createEmployee(dto)).rejects.toThrow(ConflictException);
    expect(employeeRepository.createEmployee).not.toHaveBeenCalled();
  });
});
