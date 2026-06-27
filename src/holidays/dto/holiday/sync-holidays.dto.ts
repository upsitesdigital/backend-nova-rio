import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class SyncHolidaysDto extends createZodDto(
  z.object({
    year: z.number().int().min(2020).max(2100).meta({ example: 2026 }),
  }),
) {}
