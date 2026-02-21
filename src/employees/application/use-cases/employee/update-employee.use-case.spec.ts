import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { EMPLOYEE_REPOSITORY } from '../../../domain/interfaces/employee.repository.interface.js';
import { UpdateEmployeeUseCase } from './update-employee.use-case.js';

describe('UpdateEmployeeUseCase', () => {
  let useCase: UpdateEmployeeUseCase;
  let employeeRepository: {
    findEmployeeById: Mock;
    findEmployeeByEmail: Mock;
    findEmployeeByCpf: Mock;
    updateEmployeeById: Mock;
  };

  const existingEmployee = {
    id: 1,
    name: 'Maria Silva',
    email: 'maria@example.com',
    cpf: '987.654.321-00',
    phone: '+5521999998888',
    status: 'ACTIVE',
  };

  beforeEach(async () => {
    employeeRepository = {
      findEmployeeById: vi.fn(),
      findEmployeeByEmail: vi.fn(),
      findEmployeeByCpf: vi.fn(),
      updateEmployeeById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateEmployeeUseCase,
        { provide: EMPLOYEE_REPOSITORY, useValue: employeeRepository },
      ],
    }).compile();

    useCase = module.get<UpdateEmployeeUseCase>(UpdateEmployeeUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException when employee not found', async () => {
    employeeRepository.findEmployeeById.mockResolvedValue(null);

    await expect(useCase.updateEmployeeById(999, { name: 'Test' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update employee when no uniqueness conflicts', async () => {
    const dto = { name: 'Maria Souza' };
    const updated = { ...existingEmployee, name: 'Maria Souza' };

    employeeRepository.findEmployeeById.mockResolvedValue(existingEmployee);
    employeeRepository.updateEmployeeById.mockResolvedValue(updated);

    const result = await useCase.updateEmployeeById(1, dto);

    expect(result).toEqual(updated);
    expect(employeeRepository.updateEmployeeById).toHaveBeenCalledWith(1, dto);
  });

  it('should not check email uniqueness when email unchanged', async () => {
    const dto = { email: 'maria@example.com' };

    employeeRepository.findEmployeeById.mockResolvedValue(existingEmployee);
    employeeRepository.updateEmployeeById.mockResolvedValue(existingEmployee);

    await useCase.updateEmployeeById(1, dto);

    expect(employeeRepository.findEmployeeByEmail).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when new email already in use', async () => {
    const dto = { email: 'new@example.com' };

    employeeRepository.findEmployeeById.mockResolvedValue(existingEmployee);
    employeeRepository.findEmployeeByEmail.mockResolvedValue({ id: 2, email: 'new@example.com' });

    await expect(useCase.updateEmployeeById(1, dto)).rejects.toThrow(ConflictException);
    expect(employeeRepository.updateEmployeeById).not.toHaveBeenCalled();
  });

  it('should not check cpf uniqueness when cpf unchanged', async () => {
    const dto = { cpf: '987.654.321-00' };

    employeeRepository.findEmployeeById.mockResolvedValue(existingEmployee);
    employeeRepository.updateEmployeeById.mockResolvedValue(existingEmployee);

    await useCase.updateEmployeeById(1, dto);

    expect(employeeRepository.findEmployeeByCpf).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when new cpf already in use', async () => {
    const dto = { cpf: '99999999999' };

    employeeRepository.findEmployeeById.mockResolvedValue(existingEmployee);
    employeeRepository.findEmployeeByCpf.mockResolvedValue({ id: 2, cpf: '99999999999' });

    await expect(useCase.updateEmployeeById(1, dto)).rejects.toThrow(ConflictException);
    expect(employeeRepository.updateEmployeeById).not.toHaveBeenCalled();
  });

  it('should check email and cpf in parallel when both change', async () => {
    const dto = { email: 'new@example.com', cpf: '11111111111' };
    const updated = { ...existingEmployee, ...dto };

    employeeRepository.findEmployeeById.mockResolvedValue(existingEmployee);
    employeeRepository.findEmployeeByEmail.mockResolvedValue(null);
    employeeRepository.findEmployeeByCpf.mockResolvedValue(null);
    employeeRepository.updateEmployeeById.mockResolvedValue(updated);

    const result = await useCase.updateEmployeeById(1, dto);

    expect(result).toEqual(updated);
    expect(employeeRepository.findEmployeeByEmail).toHaveBeenCalledWith('new@example.com');
    expect(employeeRepository.findEmployeeByCpf).toHaveBeenCalledWith('11111111111');
  });

  it('should throw ConflictException for email when both change and email conflicts', async () => {
    const dto = { email: 'taken@example.com', cpf: '11111111111' };

    employeeRepository.findEmployeeById.mockResolvedValue(existingEmployee);
    employeeRepository.findEmployeeByEmail.mockResolvedValue({ id: 2, email: 'taken@example.com' });
    employeeRepository.findEmployeeByCpf.mockResolvedValue(null);

    await expect(useCase.updateEmployeeById(1, dto)).rejects.toThrow(ConflictException);
    expect(employeeRepository.updateEmployeeById).not.toHaveBeenCalled();
  });
});
