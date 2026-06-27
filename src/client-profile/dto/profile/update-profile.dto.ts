import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { ServiceRecurrenceFrequency } from '@prisma/client';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: '+5521999999999' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^\+?\d[\d\s()-]{7,19}$/, { message: 'Invalid phone number format' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Acme Corp' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  company?: string;

  @ApiPropertyOptional({ example: '12345678900' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^\d{11}$|^\d{14}$/, { message: 'CPF must be 11 digits or CNPJ must be 14 digits' })
  cpfCnpj?: string;

  @ApiPropertyOptional({ example: 'Rua das Flores, 123' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ enum: ServiceRecurrenceFrequency, example: 'WEEKLY' })
  @IsEnum(ServiceRecurrenceFrequency)
  @IsOptional()
  preferredRecurrence?: ServiceRecurrenceFrequency;
}
