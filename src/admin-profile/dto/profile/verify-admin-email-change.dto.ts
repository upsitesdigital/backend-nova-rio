import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyAdminEmailChangeDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;

  @ApiProperty({ example: 'newadmin@example.com' })
  @IsEmail()
  newEmail: string;
}
