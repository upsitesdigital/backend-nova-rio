import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { UserStatus } from '@prisma/client';
import { PaginationSchemas } from '../../../shared/dto/pagination-query.schema.js';

export class ListAdminUsersQueryDto extends createZodDto(
  PaginationSchemas.query.extend({
    status: z.enum(UserStatus).optional(),
    search: z.string().optional().meta({ example: 'joao' }),
  }),
) {}
