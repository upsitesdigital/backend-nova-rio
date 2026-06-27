import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ZodPrimitives } from '../../../shared/validation/zod-primitives.js';

export class TodayAgendaQueryDto extends createZodDto(
  z.object({
    serviceId: ZodPrimitives.positiveIntQuery.optional().meta({ example: 1 }),
    unitId: ZodPrimitives.positiveIntQuery.optional().meta({ example: 1 }),
    page: ZodPrimitives.positiveIntQuery.optional().meta({ example: 1 }),
    limit: ZodPrimitives.positiveIntQuery.optional().meta({ example: 10 }),
  }),
) {}
