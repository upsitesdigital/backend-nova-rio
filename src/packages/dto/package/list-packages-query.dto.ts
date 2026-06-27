import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PaginationSchemas } from '../../../shared/dto/pagination-query.schema.js';
import { ZodPrimitives } from '../../../shared/validation/zod-primitives.js';

export class ListPackagesQueryDto extends createZodDto(
  PaginationSchemas.query.extend({
    active: z
      .preprocess(
        (value) => (value === undefined ? undefined : value === 'true' || value === true),
        z.boolean().optional(),
      )
      .meta({ description: 'Filter by active status' }),
    serviceId: ZodPrimitives.positiveIntQuery
      .optional()
      .meta({ description: 'Filter by service ID' }),
  }),
) {}
