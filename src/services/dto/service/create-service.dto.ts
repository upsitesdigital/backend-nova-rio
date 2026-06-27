import { createZodDto } from 'nestjs-zod';
import { CreateServiceSchemas } from './create-service.schema.js';

export class CreateServiceDto extends createZodDto(CreateServiceSchemas.create) {}
