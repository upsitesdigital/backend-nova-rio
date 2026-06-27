import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ServiceRecurrenceFrequency } from '@prisma/client';
import { ZodPrimitives } from '../../../shared/validation/zod-primitives.js';

export class UpdateProfileDto extends createZodDto(
  z.object({
    name: z.string().max(255).meta({ example: 'John Doe' }).optional(),
    phone: ZodPrimitives.loosePhone.meta({ example: '+5521999999999' }).optional(),
    company: z.string().max(255).meta({ example: 'Acme Corp' }).optional(),
    cpfCnpj: ZodPrimitives.cpfCnpjDigits.meta({ example: '12345678900' }).optional(),
    address: z.string().max(500).meta({ example: 'Rua das Flores, 123' }).optional(),
    preferredRecurrence: z.enum(ServiceRecurrenceFrequency).meta({ example: 'WEEKLY' }).optional(),
  }),
) {}
