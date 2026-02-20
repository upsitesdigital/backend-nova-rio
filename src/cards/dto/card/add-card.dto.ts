import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { IsValidExpiry } from '../../validators/is-valid-expiry.validator.js';

export class AddCardDto {
  @ApiProperty({ example: '1111' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}$/, { message: 'lastFourDigits must be exactly 4 digits' })
  lastFourDigits: string;

  @ApiProperty({ example: 'Visa' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  holderName: string;

  @ApiProperty({ example: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  expiryMonth: number;

  @ApiProperty({ example: 2028 })
  @IsInt()
  @IsValidExpiry()
  expiryYear: number;

  @ApiProperty({ example: 'tok_abc123' })
  @IsString()
  @IsNotEmpty()
  gatewayToken: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
