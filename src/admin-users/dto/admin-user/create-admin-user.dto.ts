import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

export class CreateAdminUserDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'joao@novario.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Str0ngP@ss' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be at least 8 characters with uppercase, lowercase, number and symbol',
    },
  )
  password: string;

  @ApiPropertyOptional({ enum: AdminRole, default: AdminRole.ADMIN_BASIC })
  @IsEnum(AdminRole)
  @IsOptional()
  role?: AdminRole;
}
