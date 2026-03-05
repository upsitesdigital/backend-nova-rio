import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ValidateCoverageQueryDto {
  @ApiProperty({ example: '20040-020', description: 'CEP to validate coverage for' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{5}-?\d{3}$/, { message: 'CEP must be in XXXXX-XXX or XXXXXXXX format' })
  cep: string;
}
