import { createZodDto } from 'nestjs-zod';
import { PaginationSchemas } from '../../../shared/dto/pagination-query.schema.js';

export class ListUnitsQueryDto extends createZodDto(PaginationSchemas.query) {}
