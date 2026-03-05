import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { CreateClientAppointmentDto } from './create-client-appointment.dto.js';

export class CreatePublicAppointmentDto extends CreateClientAppointmentDto {
  @ApiProperty({ example: 'client@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
