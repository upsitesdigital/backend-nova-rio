import { z } from 'zod';
import { RecurrenceType } from '@prisma/client';
import { ZodPrimitives } from '../../../shared/validation/zod-primitives.js';

export class CreateAppointmentSchemas {
  static create = z.object({
    date: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: 'must be a valid date string',
      })
      .meta({ example: '2026-03-15' }),
    startTime: ZodPrimitives.time.meta({ example: '09:00' }),
    duration: z.number().int().positive().max(480).meta({ example: 120 }),
    recurrenceType: z.enum(RecurrenceType).optional().meta({ example: 'SINGLE' }),
    weeklyFrequency: z.number().int().min(1).max(7).optional().meta({ example: 1 }),
    locationZip: ZodPrimitives.cep.optional().meta({ example: '20040-020' }),
    locationAddress: z.string().optional().meta({ example: 'Rua das Flores, 123' }),
    notes: z.string().optional().meta({ example: 'Levar produtos de limpeza' }),
    clientId: z.number().int().positive().meta({ example: 1 }),
    employeeId: z.number().int().positive().optional().meta({ example: 1 }),
    serviceId: z.number().int().positive().meta({ example: 1 }),
    packageId: z.number().int().positive().optional().meta({ example: 1 }),
    unitId: z.number().int().positive().optional().meta({ example: 1 }),
  });
}
