import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto.js';

export class ListAppointmentsQueryDto extends PaginationQueryDto {
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
}
