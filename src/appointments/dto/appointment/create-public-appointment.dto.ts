import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { CreateClientAppointmentDto } from './create-client-appointment.dto.js';

export class CreatePublicAppointmentDto extends createZodDto(
  CreateClientAppointmentDto.schema.extend({
    email: z.email().meta({ example: 'client@example.com' }),
  }),
) {}
