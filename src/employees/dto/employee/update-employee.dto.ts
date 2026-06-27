import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { EmployeeStatus } from '@prisma/client';
import { EmployeeSchemas } from './create-employee.schema.js';

export class UpdateEmployeeDto extends createZodDto(
  EmployeeSchemas.create.partial().extend({
    status: z.enum(EmployeeStatus).optional().meta({ example: EmployeeStatus.ACTIVE }),
  }),
) {}
