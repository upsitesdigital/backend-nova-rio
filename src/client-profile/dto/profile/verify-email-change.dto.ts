import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class VerifyEmailChangeDto extends createZodDto(
  z.object({
    code: z.string().length(6).meta({ example: '123456' }),
    newEmail: z.email().meta({ example: 'newemail@example.com' }),
  }),
) {}
