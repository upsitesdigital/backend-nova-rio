import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ZodPrimitives } from '../../../shared/validation/zod-primitives.js';

const recurrenceTypeEnum = z.enum(['SINGLE', 'PACKAGE', 'WEEKLY', 'BIWEEKLY', 'MONTHLY']);

export class RescheduleAppointmentDto extends createZodDto(
  z.object({
    date: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: 'must be a valid date string',
      })
      .optional()
      .meta({ example: '2026-03-20' }),
    startTime: ZodPrimitives.time.optional().meta({ example: '10:00' }),
    recurrenceType: recurrenceTypeEnum.optional(),
    locationZip: z.string().max(10).optional(),
    locationAddress: z.string().max(500).optional(),
  }),
) {}
