import { z } from 'zod';
import { ZodPrimitives } from '../../../shared/validation/zod-primitives.js';

export class EmployeeSchemas {
  static create = z.object({
    name: z.string().min(1).max(255).meta({ example: 'Maria Silva' }),
    email: z.email().meta({ example: 'maria@example.com' }),
    cpf: ZodPrimitives.cpf.meta({ example: '12345678900' }),
    phone: ZodPrimitives.brPhone.optional().meta({ example: '+5521999998888' }),
    address: z.string().max(500).optional().meta({ example: 'Rua das Flores, 123' }),
    avatarUrl: ZodPrimitives.httpsUrl.optional().meta({
      example: 'https://cdn.example.com/avatar.jpg',
    }),
    availabilityFrom: ZodPrimitives.time.optional().meta({ example: '08:00' }),
    availabilityTo: ZodPrimitives.time.optional().meta({ example: '18:00' }),
    notes: z.string().max(1000).optional().meta({ example: 'Experienced cleaner' }),
    unitId: z.number().int().positive().optional().meta({ example: 1 }),
  });
}
