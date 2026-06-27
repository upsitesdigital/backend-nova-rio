import { z } from 'zod';

export class UnitSchemas {
  static create = z.object({
    name: z.string().min(1).meta({ example: 'Unidade Centro' }),
    street: z.string().optional().meta({ example: 'Avenida das Américas' }),
    number: z.string().optional().meta({ example: '500' }),
    neighborhood: z.string().optional().meta({ example: 'Barra da Tijuca' }),
    city: z.string().optional().meta({ example: 'Rio de Janeiro' }),
    state: z.string().optional().meta({ example: 'RJ' }),
    cep: z.string().optional().meta({ example: '22640-102' }),
    serviceRadiusKm: z.number().min(0.1).max(100).optional().meta({ example: 5 }),
  });
}
