import { z } from 'zod';

export class HolidaySchemas {
  static create = z.object({
    date: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: 'must be a valid date string',
      })
      .meta({ example: '2026-01-01' }),
    name: z.string().min(1).meta({ example: 'Confraternização Universal' }),
    isBlocked: z.boolean().optional().meta({ example: true }),
  });
}
