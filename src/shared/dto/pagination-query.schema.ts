import { z } from 'zod';

/**
 * Shared pagination query schema. Exposed as a static so other query DTOs can
 * extend it (e.g. `PaginationSchemas.query.extend({ ... })`).
 */
export class PaginationSchemas {
  static query = z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  });
}
