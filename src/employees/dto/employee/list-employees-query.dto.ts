import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { EmployeeStatus } from '@prisma/client';
import { PaginationSchemas } from '../../../shared/dto/pagination-query.schema.js';

export class ListEmployeesQueryDto extends createZodDto(
  PaginationSchemas.query.extend({
    status: z.enum(EmployeeStatus).optional(),
    search: z.string().optional().meta({ example: 'maria' }),
  }),
) {}
