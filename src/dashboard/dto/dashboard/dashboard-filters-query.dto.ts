import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ZodPrimitives } from '../../../shared/validation/zod-primitives.js';

export class DashboardFiltersQueryDto extends createZodDto(
  z.object({
    unitId: ZodPrimitives.positiveIntQuery.optional().meta({ example: 1 }),
  }),
) {}
