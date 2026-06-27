import { createZodDto } from 'nestjs-zod';
import { PackageSchemas } from './create-package.schema.js';

export class CreatePackageDto extends createZodDto(PackageSchemas.create) {}
