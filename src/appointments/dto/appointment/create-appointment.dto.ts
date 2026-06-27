import { createZodDto } from 'nestjs-zod';
import { CreateAppointmentSchemas } from './create-appointment.schema.js';

export class CreateAppointmentDto extends createZodDto(CreateAppointmentSchemas.create) {}
