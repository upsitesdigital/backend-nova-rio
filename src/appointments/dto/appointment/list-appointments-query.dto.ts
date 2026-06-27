import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AppointmentStatus } from '@prisma/client';
import { PaginationSchemas } from '../../../shared/dto/pagination-query.schema.js';
import { ZodPrimitives } from '../../../shared/validation/zod-primitives.js';

export class ListAppointmentsQueryDto extends createZodDto(
  PaginationSchemas.query.extend({
    date: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: 'must be a valid date string',
      })
      .optional()
      .meta({ example: '2026-03-15' }),
    weekStart: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: 'must be a valid date string',
      })
      .optional()
      .meta({ example: '2026-03-10' }),
    weekEnd: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: 'must be a valid date string',
      })
      .optional()
      .meta({ example: '2026-03-16' }),
    employeeId: ZodPrimitives.positiveIntQuery.optional().meta({ example: 1 }),
    unitId: ZodPrimitives.positiveIntQuery.optional().meta({ example: 1 }),
    status: z.enum(AppointmentStatus).optional().meta({ example: 'SCHEDULED' }),
  }),
) {}
