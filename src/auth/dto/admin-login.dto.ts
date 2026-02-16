import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@novario.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin@2026!' })
  @IsString()
  @MinLength(6)
  password: string;
}
