import { createZodDto } from 'nestjs-zod';
import { PaymentMethod } from '@prisma/client';
import { z } from 'zod';

export class CreatePublicPaymentDto extends createZodDto(
  z.object({
    email: z.email().meta({ example: 'cliente@example.com' }),
    appointmentId: z.number().int().positive().meta({ example: 1 }),
    method: z.enum(PaymentMethod).meta({ example: 'PIX' }),
    cardNumber: z.string().min(13).optional().meta({ example: '4111111111111111' }),
    cardCvv: z.string().min(3).optional().meta({ example: '123' }),
    cardExpiry: z.string().optional().meta({ example: '12/2028' }),
    holderName: z.string().optional().meta({ example: 'João Silva' }),
    billingName: z.string().optional(),
    billingDocument: z.string().optional(),
    billingAddress: z.string().optional(),
    billingComplement: z.string().optional(),
  }),
) {}
