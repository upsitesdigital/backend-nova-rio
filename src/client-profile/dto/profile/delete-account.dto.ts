import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class DeleteAccountDto extends createZodDto(
  z.object({
    confirmPhrase: z
      .literal('Apagar minha conta', {
        message: 'Confirmation phrase must be "Apagar minha conta"',
      })
      .meta({ example: 'Apagar minha conta' }),
  }),
) {}
