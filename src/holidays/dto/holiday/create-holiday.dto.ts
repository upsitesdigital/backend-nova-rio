import { createZodDto } from 'nestjs-zod';
import { HolidaySchemas } from './create-holiday.schema.js';

export class CreateHolidayDto extends createZodDto(HolidaySchemas.create) {}
