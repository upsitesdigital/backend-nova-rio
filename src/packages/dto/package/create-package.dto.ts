import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreatePackageDto {
  @ApiProperty({ example: 'Pacote 10 horas' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Pacote com 10 horas de faxina' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsInt()
  @IsPositive()
  @IsOptional()
  totalHours?: number;

  @ApiProperty({ example: 1200.0 })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  serviceId: number;
}
