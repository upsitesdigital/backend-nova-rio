import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ZodPrimitives } from '../../../shared/validation/zod-primitives.js';

export class VerifyPasswordChangeDto extends createZodDto(
  z.object({
    code: z.string().length(6).meta({ example: '123456' }),
    newPassword: ZodPrimitives.strongPassword.meta({ example: 'NewPass@2026!' }),
  }),
) {}
