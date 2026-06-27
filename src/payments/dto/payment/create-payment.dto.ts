import { createZodDto } from 'nestjs-zod';
import { PaymentMethod } from '@prisma/client';
import { z } from 'zod';

export class CreatePaymentDto extends createZodDto(
  z.object({
    appointmentId: z.number().int().positive().meta({ example: 1 }),
    method: z.enum(PaymentMethod).meta({ example: 'PIX' }),
    cardId: z.number().int().positive().optional().meta({ example: 1 }),
  }),
) {}
