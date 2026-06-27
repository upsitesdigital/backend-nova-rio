import { createZodDto } from 'nestjs-zod';
import { CreateAppointmentSchemas } from './create-appointment.schema.js';

export class UpdateAppointmentDto extends createZodDto(
  CreateAppointmentSchemas.create.omit({ clientId: true }).partial(),
) {}
