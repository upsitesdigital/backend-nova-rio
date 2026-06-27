import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { ServiceRecurrenceFrequency } from '@prisma/client';

export class CreateServiceDto {
  @ApiProperty({ example: 'Faxina Regular' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Limpeza residencial completa' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'cleaning-regular' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ example: 150.0 })
  @IsNumber()
  @IsPositive()
  basePrice: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  allowSingle?: boolean;

  @ApiPropertyOptional({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  allowPackage?: boolean;

  @ApiPropertyOptional({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  allowRecurrence?: boolean;

  @ApiPropertyOptional({
    enum: ServiceRecurrenceFrequency,
    isArray: true,
    example: ['WEEKLY', 'MONTHLY'],
  })
  @IsArray()
  @IsEnum(ServiceRecurrenceFrequency, { each: true })
  @IsOptional()
  recurrenceFrequencies?: ServiceRecurrenceFrequency[];
}
