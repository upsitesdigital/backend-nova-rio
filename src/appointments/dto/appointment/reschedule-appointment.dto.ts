import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, Matches } from 'class-validator';

export class RescheduleAppointmentDto {
  @ApiProperty({ example: '2026-03-20' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '10:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime must be in HH:mm format' })
  startTime: string;
}
