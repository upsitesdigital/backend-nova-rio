import { ApiPropertyOptional } from '@nestjs/swagger';
import { EmployeeStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto.js';

export class ListEmployeesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: EmployeeStatus })
  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;

  @ApiPropertyOptional({ example: 'maria' })
  @IsString()
  @IsOptional()
  search?: string;
}
