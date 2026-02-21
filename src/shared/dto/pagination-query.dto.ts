import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
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
