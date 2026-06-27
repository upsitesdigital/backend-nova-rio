import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PaymentStatus } from '@prisma/client';
import { PaginationSchemas } from '../../../shared/dto/pagination-query.schema.js';

export class ListClientPaymentsQueryDto extends createZodDto(
  PaginationSchemas.query.extend({
    status: z.enum(PaymentStatus).optional().meta({ example: 'PENDING' }),
  }),
) {}
