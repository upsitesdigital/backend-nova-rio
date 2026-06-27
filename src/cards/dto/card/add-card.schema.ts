import { z } from 'zod';
import cardValidator from 'card-validator';
import { ZodPrimitives } from '../../../shared/validation/zod-primitives.js';

export class CardSchemas {
  static add = z
    .object({
      lastFourDigits: ZodPrimitives.cardLastFour.meta({ example: '1111' }),
      brand: z
        .enum([
          'VISA',
          'MASTERCARD',
          'ELO',
          'AMEX',
          'HIPERCARD',
          'DINERS',
          'DISCOVER',
          'JCB',
          'UNKNOWN',
        ])
        .meta({ example: 'VISA' }),
      holderName: ZodPrimitives.cardHolderName.meta({ example: 'JOAO SILVA' }),
      expiryMonth: z.number().int().min(1).max(12).meta({ example: 12 }),
      expiryYear: z.number().int().meta({ example: 2028 }),
      gatewayToken: z.string().min(1).max(255).meta({ example: 'tok_abc123' }),
      isDefault: z.boolean().optional().meta({ example: false }),
    })
    .superRefine((data, ctx) => {
      const month = String(data.expiryMonth).padStart(2, '0');
      const year = String(data.expiryYear);
      if (!cardValidator.expirationDate({ month, year }).isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['expiryYear'],
          message: 'Card expiry date is invalid or already expired',
        });
      }
    });
}
