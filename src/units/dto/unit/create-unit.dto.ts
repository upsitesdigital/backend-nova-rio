import { createZodDto } from 'nestjs-zod';
import { UnitSchemas } from './create-unit.schema.js';

export class CreateUnitDto extends createZodDto(UnitSchemas.create) {}
