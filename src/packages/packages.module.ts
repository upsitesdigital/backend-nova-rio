import { DiTokens } from '../shared/di/di-tokens.js';
import { Module } from '@nestjs/common';
import { ServicesModule } from '../services/services.module.js';
import { CreatePackageUseCase } from './application/use-cases/package/create-package.use-case.js';
import { DeletePackageUseCase } from './application/use-cases/package/delete-package.use-case.js';
import { GetPackageUseCase } from './application/use-cases/package/get-package.use-case.js';
import { ListPackagesUseCase } from './application/use-cases/package/list-packages.use-case.js';
import { ReactivatePackageUseCase } from './application/use-cases/package/reactivate-package.use-case.js';
import { UpdatePackageUseCase } from './application/use-cases/package/update-package.use-case.js';
import { PrismaPackageRepository } from './infrastructure/repositories/prisma-package.repository.js';
import { PackagesController } from './packages.controller.js';

@Module({
  imports: [ServicesModule],
  controllers: [PackagesController],
  providers: [
    { provide: DiTokens.packageRepository, useClass: PrismaPackageRepository },
    CreatePackageUseCase,
    ListPackagesUseCase,
    GetPackageUseCase,
    UpdatePackageUseCase,
    ReactivatePackageUseCase,
    DeletePackageUseCase,
  ],
})
export class PackagesModule {}
