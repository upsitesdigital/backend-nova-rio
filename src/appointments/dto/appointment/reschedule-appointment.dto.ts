import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ZodPrimitives } from '../../../shared/validation/zod-primitives.js';

export class RescheduleAppointmentDto extends createZodDto(
  z.object({
    date: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: 'must be a valid date string',
      })
      .meta({ example: '2026-03-20' }),
    startTime: ZodPrimitives.time.meta({ example: '10:00' }),
  }),
) {}
