import { createZodDto } from 'nestjs-zod';
import { PaginationSchemas } from './pagination-query.schema.js';

export class PaginationQueryDto extends createZodDto(PaginationSchemas.query) {}
