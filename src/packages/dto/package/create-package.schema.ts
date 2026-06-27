import { z } from 'zod';

export class PackageSchemas {
  static create = z.object({
    name: z.string().min(1).meta({ example: 'Pacote 10 horas' }),
    description: z.string().optional().meta({ example: 'Pacote com 10 horas de faxina' }),
    totalHours: z.number().int().positive().optional().meta({ example: 10 }),
    price: z.number().positive().meta({ example: 1200.0 }),
    serviceId: z.number().int().positive().meta({ example: 1 }),
  });
}
