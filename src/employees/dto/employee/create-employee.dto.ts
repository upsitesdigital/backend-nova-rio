import { createZodDto } from 'nestjs-zod';
import { EmployeeSchemas } from './create-employee.schema.js';

export class CreateEmployeeDto extends createZodDto(EmployeeSchemas.create) {}
