import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ZodPrimitives } from '../../../shared/validation/zod-primitives.js';

export class ValidateCoverageQueryDto extends createZodDto(
  z.object({
    cep: ZodPrimitives.cep.meta({ example: '20040-020' }),
  }),
) {}
