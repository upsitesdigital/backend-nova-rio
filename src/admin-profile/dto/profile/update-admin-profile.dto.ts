import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAdminProfileDto {
  @ApiPropertyOptional({ example: 'Admin Master' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;
}
