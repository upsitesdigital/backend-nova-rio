import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ZodPrimitives } from '../../shared/validation/zod-primitives.js';

export class ResetPasswordDto extends createZodDto(
  z.object({
    email: z.email().meta({ example: 'john@example.com' }),
    code: ZodPrimitives.verificationCode.meta({ example: '123456' }),
    newPassword: ZodPrimitives.strongPassword.meta({ example: 'NewPass@2026!' }),
  }),
) {}
