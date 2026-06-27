import { createZodDto } from 'nestjs-zod';
import { PackageSchemas } from './create-package.schema.js';

export class UpdatePackageDto extends createZodDto(PackageSchemas.create.partial()) {}
