import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class UpdateAdminProfileDto extends createZodDto(
  z.object({
    name: z.string().max(255).meta({ example: 'Admin Master' }).optional(),
  }),
) {}
