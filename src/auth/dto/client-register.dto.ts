import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ZodPrimitives } from '../../shared/validation/zod-primitives.js';

export class ClientRegisterDto extends createZodDto(
  z.object({
    name: z.string().min(1).max(255).meta({ example: 'John Doe' }),
    email: z.email().meta({ example: 'john@example.com' }),
    phone: ZodPrimitives.loosePhone.optional().meta({ example: '+5521999999999' }),
    password: ZodPrimitives.strongPassword.meta({ example: 'Admin@2026!' }),
  }),
) {}
