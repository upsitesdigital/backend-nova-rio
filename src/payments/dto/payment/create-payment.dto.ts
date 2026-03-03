import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  appointmentId!: number;

  @ApiProperty({ enum: PaymentMethod, example: 'PIX' })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsPositive()
  @IsOptional()
  cardId?: number;
}
