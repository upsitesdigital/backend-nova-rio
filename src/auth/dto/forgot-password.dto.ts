import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class ForgotPasswordDto extends createZodDto(
  z.object({
    email: z.email().meta({ example: 'john@example.com' }),
  }),
) {}
