import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { ZodPrimitives } from '../../../shared/validation/zod-primitives.js';
import { PaginationSchemas } from '../../../shared/dto/pagination-query.schema.js';

export class ListPaymentsQueryDto extends createZodDto(
  PaginationSchemas.query.extend({
    status: z.enum(PaymentStatus).optional().meta({ example: 'PENDING' }),
    method: z.enum(PaymentMethod).optional().meta({ example: 'PIX' }),
    clientId: ZodPrimitives.positiveIntQuery.optional().meta({ example: 1 }),
    dateFrom: z
      .string()
      .refine((v) => !Number.isNaN(Date.parse(v)), {
        message: 'must be a valid date string',
      })
      .optional()
      .meta({ example: '2026-01-01' }),
    dateTo: z
      .string()
      .refine((v) => !Number.isNaN(Date.parse(v)), {
        message: 'must be a valid date string',
      })
      .optional()
      .meta({ example: '2026-12-31' }),
  }),
) {}
