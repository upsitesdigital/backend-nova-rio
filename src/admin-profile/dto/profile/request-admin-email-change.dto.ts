import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RequestAdminEmailChangeDto {
  @ApiProperty({ example: 'newadmin@example.com' })
  @IsEmail()
  newEmail: string;
}
