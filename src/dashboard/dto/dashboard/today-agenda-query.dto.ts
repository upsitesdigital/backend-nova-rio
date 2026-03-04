import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class TodayAgendaQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Filter by service ID' })
  @Transform(({ value }) => (value ? parseInt(value as string, 10) : undefined))
  @IsInt()
  @IsPositive()
  @IsOptional()
  serviceId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Filter by unit ID' })
  @Transform(({ value }) => (value ? parseInt(value as string, 10) : undefined))
  @IsInt()
  @IsPositive()
  @IsOptional()
  unitId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Page number', default: 1 })
  @Transform(({ value }) => (value ? parseInt(value as string, 10) : 1))
  @IsInt()
  @IsPositive()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 10, description: 'Items per page', default: 10 })
  @Transform(({ value }) => (value ? parseInt(value as string, 10) : 10))
  @IsInt()
  @IsPositive()
  @IsOptional()
  limit?: number;
}
