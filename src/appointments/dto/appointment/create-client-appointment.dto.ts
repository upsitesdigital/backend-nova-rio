import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { RecurrenceType } from '@prisma/client';

export class CreateClientAppointmentDto {
  @ApiProperty({ example: '2026-03-15' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime must be in HH:mm format' })
  startTime: string;

  @ApiProperty({ example: 120 })
  @IsInt()
  @IsPositive()
  @Max(480)
  duration: number;

  @ApiPropertyOptional({ enum: RecurrenceType, example: 'SINGLE' })
  @IsEnum(RecurrenceType)
  @IsOptional()
  recurrenceType?: RecurrenceType;

  @ApiPropertyOptional({
    example: 1,
    description: 'Vezes por semana (1-7), aplicável quando WEEKLY',
  })
  @IsInt()
  @Min(1)
  @Max(7)
  @IsOptional()
  weeklyFrequency?: number;

  @ApiPropertyOptional({ example: '20040-020' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  locationZip?: string;

  @ApiPropertyOptional({ example: 'Rua das Flores, 123' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  locationAddress?: string;

  @ApiPropertyOptional({ example: 'Levar produtos de limpeza' })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsPositive()
  @IsOptional()
  employeeId?: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  serviceId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsPositive()
  @IsOptional()
  packageId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsPositive()
  @IsOptional()
  unitId?: number;
}
