import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { IsValidExpiry } from '../../validators/is-valid-expiry.validator.js';

export class AddCardDto {
  @ApiProperty({ example: '1111', description: 'Last four digits of the card' })
  @IsString()
  @IsNotEmpty()
  @Length(4, 4, { message: 'lastFourDigits must be exactly 4 characters' })
  lastFourDigits: string;

  @ApiProperty({
    example: 'visa',
    description: 'Card brand (visa, mastercard, elo, amex, hipercard)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  brand: string;

  @ApiProperty({ example: 'Joao Silva' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
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
