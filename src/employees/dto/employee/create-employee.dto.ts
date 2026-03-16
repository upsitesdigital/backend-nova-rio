import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';
import { IsCPF } from 'class-validator-cpf';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Maria Silva' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'maria@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345678900' })
  @IsCPF({ message: 'CPF is invalid' })
  @IsNotEmpty()
  cpf: string;

  @ApiPropertyOptional({ example: '+5521999998888' })
  @IsPhoneNumber('BR', { message: 'phone must be a valid Brazilian phone number' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Rua das Flores, 123' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.jpg' })
  @IsUrl(
    { protocols: ['https'], require_protocol: true },
    { message: 'avatarUrl must be a valid HTTPS URL' },
  )
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: '08:00' })
  @IsString()
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: 'availabilityFrom must be in HH:mm format' })
  availabilityFrom?: string;

  @ApiPropertyOptional({ example: '18:00' })
  @IsString()
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: 'availabilityTo must be in HH:mm format' })
  availabilityTo?: string;

  @ApiPropertyOptional({ example: 'Experienced cleaner' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsPositive()
  @IsOptional()
  unitId?: number;
}
