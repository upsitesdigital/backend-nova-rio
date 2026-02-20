import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsPositive, Max, Min } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export class ListAppointmentsQueryDto {
  @ApiPropertyOptional({ example: '2026-03-15' })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ example: '2026-03-10' })
  @IsDateString()
  @IsOptional()
  weekStart?: string;

  @ApiPropertyOptional({ example: '2026-03-16' })
  @IsDateString()
  @IsOptional()
  weekEnd?: string;

  @ApiPropertyOptional({ example: 1 })
  @Transform(({ value }) => (value ? parseInt(value as string, 10) : undefined))
  @IsInt()
  @IsPositive()
  @IsOptional()
  employeeId?: number;

  @ApiPropertyOptional({ example: 1 })
  @Transform(({ value }) => (value ? parseInt(value as string, 10) : undefined))
  @IsInt()
  @IsPositive()
  @IsOptional()
  unitId?: number;

  @ApiPropertyOptional({ enum: AppointmentStatus, example: 'SCHEDULED' })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @Transform(({ value }) => (value ? parseInt(value as string, 10) : 1))
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @Transform(({ value }) => (value ? parseInt(value as string, 10) : 20))
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}
