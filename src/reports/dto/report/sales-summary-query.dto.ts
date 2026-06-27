import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ZodPrimitives } from '../../../shared/validation/zod-primitives.js';

export class SalesSummaryQueryDto extends createZodDto(
  z.object({
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
    unitId: ZodPrimitives.positiveIntQuery.optional().meta({ example: 1 }),
    serviceId: ZodPrimitives.positiveIntQuery.optional().meta({ example: 1 }),
  }),
) {}
