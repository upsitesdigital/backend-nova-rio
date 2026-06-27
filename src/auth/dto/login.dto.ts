import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ZodPrimitives } from '../../shared/validation/zod-primitives.js';

export class LoginDto extends createZodDto(
  z.object({
    email: z.email().meta({ example: 'user@novario.com' }),
    password: ZodPrimitives.strongPassword.meta({ example: 'Str0ng@Pass' }),
  }),
) {}
