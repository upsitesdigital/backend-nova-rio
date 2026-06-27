import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class RequestEmailChangeDto extends createZodDto(
  z.object({
    newEmail: z.email().meta({ example: 'newemail@example.com' }),
  }),
) {}
