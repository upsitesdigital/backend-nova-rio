import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAdminUserDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'joao@novario.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Str0ngP@ss' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ enum: AdminRole, default: AdminRole.ADMIN_BASIC })
  @IsEnum(AdminRole)
  @IsOptional()
  role?: AdminRole;
}
