import { createZodDto } from 'nestjs-zod';
import { HolidaySchemas } from './create-holiday.schema.js';

export class UpdateHolidayDto extends createZodDto(HolidaySchemas.create.partial()) {}
