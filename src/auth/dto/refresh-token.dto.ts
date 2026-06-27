import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class RefreshTokenDto extends createZodDto(
  z.object({
    refreshToken: z.string().min(1).meta({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }),
  }),
) {}
