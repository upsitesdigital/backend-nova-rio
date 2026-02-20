import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class SyncHolidaysDto {
  @ApiProperty({ example: 2026, description: 'Year to sync holidays from BrasilAPI' })
  @IsInt()
  @Min(2020)
  @Max(2100)
  year: number;
}
