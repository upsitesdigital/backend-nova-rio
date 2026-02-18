import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateEmployeeUseCase } from './application/use-cases/employee/create-employee.use-case.js';
import { DeactivateEmployeeUseCase } from './application/use-cases/employee/deactivate-employee.use-case.js';
import { GetEmployeeUseCase } from './application/use-cases/employee/get-employee.use-case.js';
import { ListEmployeesUseCase } from './application/use-cases/employee/list-employees.use-case.js';
import { UpdateEmployeeUseCase } from './application/use-cases/employee/update-employee.use-case.js';
import { CreateEmployeeDto } from './dto/employee/create-employee.dto.js';
import { ListEmployeesQueryDto } from './dto/employee/list-employees-query.dto.js';
import { UpdateEmployeeDto } from './dto/employee/update-employee.dto.js';

@ApiTags('Employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_MASTER', 'ADMIN_BASIC')
@Controller('employees')
export class EmployeesController {
  constructor(
    private createEmployeeUseCase: CreateEmployeeUseCase,
    private listEmployeesUseCase: ListEmployeesUseCase,
    private getEmployeeUseCase: GetEmployeeUseCase,
    private updateEmployeeUseCase: UpdateEmployeeUseCase,
    private deactivateEmployeeUseCase: DeactivateEmployeeUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiCreatedResponse({ description: 'Employee created successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({ description: 'Email or CPF already in use' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  createEmployee(@Body() dto: CreateEmployeeDto) {
    return this.createEmployeeUseCase.createEmployee(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List employees with optional filters' })
  @ApiOkResponse({ description: 'Returns list of employees' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  listEmployees(@Query() query: ListEmployeesQueryDto) {
    return this.listEmployeesUseCase.listEmployees(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an employee by ID' })
  @ApiOkResponse({ description: 'Returns the employee' })
  @ApiNotFoundResponse({ description: 'Employee not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getEmployeeById(@Param('id', ParseIntPipe) id: number) {
    return this.getEmployeeUseCase.getEmployeeById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an employee' })
  @ApiOkResponse({ description: 'Employee updated successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({ description: 'Email or CPF already in use' })
  @ApiNotFoundResponse({ description: 'Employee not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  updateEmployeeById(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEmployeeDto) {
    return this.updateEmployeeUseCase.updateEmployeeById(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete an employee' })
  @ApiNoContentResponse({ description: 'Employee deactivated successfully' })
  @ApiNotFoundResponse({ description: 'Employee not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  deactivateEmployeeById(@Param('id', ParseIntPipe) id: number) {
    return this.deactivateEmployeeUseCase.deactivateEmployeeById(id);
  }
}
