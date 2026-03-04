import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsPositive } from 'class-validator';

export class HoursByServiceQueryDto {
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
}
