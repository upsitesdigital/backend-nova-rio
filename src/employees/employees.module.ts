import { DiTokens } from '../shared/di/di-tokens.js';
import { Module } from '@nestjs/common';
import { CreateEmployeeUseCase } from './application/use-cases/employee/create-employee.use-case.js';
import { DeactivateEmployeeUseCase } from './application/use-cases/employee/deactivate-employee.use-case.js';
import { GetEmployeeUseCase } from './application/use-cases/employee/get-employee.use-case.js';
import { ListEmployeesUseCase } from './application/use-cases/employee/list-employees.use-case.js';
import { UpdateEmployeeUseCase } from './application/use-cases/employee/update-employee.use-case.js';
import { EmployeesController } from './employees.controller.js';
import { PrismaEmployeeRepository } from './infrastructure/repositories/prisma-employee.repository.js';

@Module({
  controllers: [EmployeesController],
  providers: [
    { provide: DiTokens.employeeRepository, useClass: PrismaEmployeeRepository },
    CreateEmployeeUseCase,
    ListEmployeesUseCase,
    GetEmployeeUseCase,
    UpdateEmployeeUseCase,
    DeactivateEmployeeUseCase,
  ],
})
export class EmployeesModule {}
