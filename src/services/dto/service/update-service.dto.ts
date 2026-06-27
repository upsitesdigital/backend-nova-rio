import { createZodDto } from 'nestjs-zod';
import { CreateServiceSchemas } from './create-service.schema.js';

export class UpdateServiceDto extends createZodDto(CreateServiceSchemas.create.partial()) {}
