import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { IsValidExpiry } from '../../validators/is-valid-expiry.validator.js';

export class AddCardDto {
  @ApiProperty({ example: '1111', description: 'Last four digits of the card' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}$/, { message: 'lastFourDigits must be exactly 4 digits' })
  lastFourDigits: string;

  @ApiProperty({
    example: 'VISA',
    description: 'Card brand',
    enum: [
      'VISA',
      'MASTERCARD',
      'ELO',
      'AMEX',
      'HIPERCARD',
      'DINERS',
      'DISCOVER',
      'JCB',
      'UNKNOWN',
    ],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['VISA', 'MASTERCARD', 'ELO', 'AMEX', 'HIPERCARD', 'DINERS', 'DISCOVER', 'JCB', 'UNKNOWN'])
  brand: string;

  @ApiProperty({ example: 'JOAO SILVA' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(26)
  @Matches(/^[A-Za-z\s\-'.]+$/, {
    message: 'holderName must contain only letters, spaces, hyphens, apostrophes, or periods',
  })
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
  @MaxLength(255)
  gatewayToken: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
