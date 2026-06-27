import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AdminRole } from '@prisma/client';
import { ZodPrimitives } from '../../../shared/validation/zod-primitives.js';

export class CreateAdminUserDto extends createZodDto(
  z.object({
    name: z.string().min(1).max(255).meta({ example: 'João Silva' }),
    email: z.email().meta({ example: 'joao@novario.com' }),
    password: ZodPrimitives.strongPassword.meta({ example: 'Str0ngP@ss' }),
    role: z.enum(AdminRole).optional().meta({ example: AdminRole.ADMIN_BASIC }),
  }),
) {}
