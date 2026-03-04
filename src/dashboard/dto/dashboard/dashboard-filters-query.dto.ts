import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class DashboardFiltersQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Filter by unit ID' })
  @Transform(({ value }) => (value ? parseInt(value as string, 10) : undefined))
  @IsInt()
  @IsPositive()
  @IsOptional()
  unitId?: number;
}
