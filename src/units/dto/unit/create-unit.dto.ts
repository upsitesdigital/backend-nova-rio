import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateUnitDto {
  @ApiProperty({ example: 'Unidade Centro' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Rua das Flores, 123 - Centro' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: -22.9068 })
  @IsNumber()
  @IsOptional()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: -43.1729 })
  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ example: 5, description: 'Service radius in kilometers' })
  @IsNumber()
  @IsOptional()
  @Min(0.1)
  @Max(100)
  serviceRadiusKm?: number;
}
