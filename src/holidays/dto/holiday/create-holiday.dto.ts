import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateHolidayDto {
  @ApiProperty({ example: '2026-01-01', description: 'Holiday date in ISO format' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Confraternização Universal', description: 'Holiday name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Whether this holiday blocks scheduling',
  })
  @IsBoolean()
  @IsOptional()
  isBlocked?: boolean;
}
