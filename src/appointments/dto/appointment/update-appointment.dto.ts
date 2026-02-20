import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAppointmentDto } from './create-appointment.dto.js';

export class UpdateAppointmentDto extends PartialType(
  OmitType(CreateAppointmentDto, ['clientId'] as const),
) {}
