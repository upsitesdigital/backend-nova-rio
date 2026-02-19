import { PartialType } from '@nestjs/swagger';
import { CreatePackageDto } from './create-package.dto.js';

export class UpdatePackageDto extends PartialType(CreatePackageDto) {}
