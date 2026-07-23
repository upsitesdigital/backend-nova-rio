import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AdminRole, UserStatus } from '@prisma/client';
import { ZodPrimitives } from '../../../shared/validation/zod-primitives.js';

export class UpdateAdminUserDto extends createZodDto(
  z.object({
    name: z.string().min(1).max(255).optional().meta({ example: 'João Silva' }),
    email: z.email().optional().meta({ example: 'joao@novario.com' }),
    password: ZodPrimitives.strongPassword.optional().meta({ example: 'Str0ngP@ss' }),
    role: z.enum(AdminRole).optional().meta({ example: AdminRole.ADMIN_BASIC }),
    status: z.enum(UserStatus).optional().meta({ example: UserStatus.ACTIVE }),
  }),
) {}
