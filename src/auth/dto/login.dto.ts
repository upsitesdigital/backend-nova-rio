import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsStrongPassword, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@novario.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Str0ng@Pass' })
  @IsString()
  @MaxLength(128)
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
}
