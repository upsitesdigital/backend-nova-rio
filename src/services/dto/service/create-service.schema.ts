import { z } from 'zod';
import { ServiceRecurrenceFrequency } from '@prisma/client';

export class CreateServiceSchemas {
  static create = z.object({
    name: z.string().min(1).meta({ example: 'Faxina Regular' }),
    description: z.string().optional().meta({ example: 'Limpeza residencial completa' }),
    icon: z.string().optional().meta({ example: 'cleaning-regular' }),
    basePrice: z.number().positive().meta({ example: 150.0 }),
    allowSingle: z.boolean().optional().meta({ example: true }),
    allowPackage: z.boolean().optional().meta({ example: false }),
    allowRecurrence: z.boolean().optional().meta({ example: false }),
    recurrenceFrequencies: z
      .array(z.enum(ServiceRecurrenceFrequency))
      .optional()
      .meta({ example: ['WEEKLY', 'MONTHLY'] }),
  });
}
