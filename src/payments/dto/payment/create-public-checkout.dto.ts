import { createZodDto } from 'nestjs-zod';
import { PaymentMethod, RecurrenceType } from '@prisma/client';
import { z } from 'zod';
import { ZodPrimitives } from '../../../shared/validation/zod-primitives.js';

export class CreatePublicCheckoutDto extends createZodDto(
  z.object({
    // Client + appointment
    email: z.email().meta({ example: 'cliente@example.com' }),
    date: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: 'must be a valid date string',
      })
      .meta({ example: '2026-03-15' }),
    startTime: ZodPrimitives.time.meta({ example: '09:00' }),
    duration: z.number().int().positive().max(480).meta({ example: 120 }),
    serviceId: z.number().int().positive().meta({ example: 1 }),
    recurrenceType: z.enum(RecurrenceType).optional().meta({ example: 'SINGLE' }),
    weeklyFrequency: z.number().int().min(1).max(7).optional().meta({ example: 1 }),
    packageId: z.number().int().positive().optional().meta({ example: 1 }),
    unitId: z.number().int().positive().optional().meta({ example: 1 }),
    notes: z.string().max(2000).optional().meta({ example: 'Levar produtos de limpeza' }),
    locationZip: z.string().max(10).optional().meta({ example: '20040-020' }),
    locationAddress: z.string().max(500).optional().meta({ example: 'Rua das Flores, 123' }),
    // Payment
    method: z.enum(PaymentMethod).meta({ example: 'CREDIT_CARD' }),
    cardNumber: z.string().min(13).optional().meta({ example: '4242424242424242' }),
    cardCvv: z.string().min(3).optional().meta({ example: '123' }),
    cardExpiry: z.string().optional().meta({ example: '12/2030' }),
    holderName: z.string().optional().meta({ example: 'João Silva' }),
    billingName: z.string().optional(),
    billingDocument: z.string().optional(),
    billingAddress: z.string().optional(),
    billingComplement: z.string().optional(),
  }),
) {}
