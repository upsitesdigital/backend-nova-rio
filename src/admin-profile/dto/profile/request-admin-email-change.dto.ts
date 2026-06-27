import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class RequestAdminEmailChangeDto extends createZodDto(
  z.object({
    newEmail: z.email().meta({ example: 'newadmin@example.com' }),
  }),
) {}
