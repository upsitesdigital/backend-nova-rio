import { ApiProperty } from '@nestjs/swagger';
import { Equals, IsNotEmpty, IsString } from 'class-validator';

export class DeleteAccountDto {
  @ApiProperty({ example: 'Apagar minha conta' })
  @IsString()
  @IsNotEmpty()
  @Equals('Apagar minha conta', { message: 'Confirmation phrase must be "Apagar minha conta"' })
  confirmPhrase: string;
}
