import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

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
  cpfCnpj?: string;

  @ApiPropertyOptional({ example: 'Rua das Flores, 123' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;
}
