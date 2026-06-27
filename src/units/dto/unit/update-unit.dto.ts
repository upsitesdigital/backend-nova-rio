import { createZodDto } from 'nestjs-zod';
import { UnitSchemas } from './create-unit.schema.js';

export class UpdateUnitDto extends createZodDto(UnitSchemas.create.partial()) {}
