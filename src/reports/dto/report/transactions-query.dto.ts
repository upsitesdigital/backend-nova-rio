import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class TransactionsQueryDto {
  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @ApiPropertyOptional({ example: 1 })
  @Transform(({ value }) => (value ? parseInt(value as string, 10) : undefined))
  @IsInt()
  @IsPositive()
  @IsOptional()
  unitId?: number;

  @ApiPropertyOptional({ example: 1 })
  @Transform(({ value }) => (value ? parseInt(value as string, 10) : undefined))
  @IsInt()
  @IsPositive()
  @IsOptional()
  serviceId?: number;

  @ApiPropertyOptional({ example: 'month', enum: ['day', 'week', 'month'] })
  @IsString()
  @IsIn(['day', 'week', 'month'])
  @IsOptional()
  groupBy?: 'day' | 'week' | 'month' = 'month';
}
