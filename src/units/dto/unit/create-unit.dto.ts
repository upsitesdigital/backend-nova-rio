import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateUnitDto {
  @ApiProperty({ example: 'Unidade Centro' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Avenida das Américas' })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiPropertyOptional({ example: '500' })
  @IsString()
  @IsOptional()
  number?: string;

  @ApiPropertyOptional({ example: 'Barra da Tijuca' })
  @IsString()
  @IsOptional()
  neighborhood?: string;

  @ApiPropertyOptional({ example: 'Rio de Janeiro' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'RJ' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: '22640-102' })
  @IsString()
  @IsOptional()
  cep?: string;

  @ApiPropertyOptional({ example: 5, description: 'Service radius in kilometers' })
  @IsNumber()
  @IsOptional()
  @Min(0.1)
  @Max(100)
  serviceRadiusKm?: number;
}
