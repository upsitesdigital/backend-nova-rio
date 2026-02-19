import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Package } from '@prisma/client';
import { PACKAGE_REPOSITORY } from '../../../domain/interfaces/package.repository.interface.js';
import type { IPackageRepository } from '../../../domain/interfaces/package.repository.interface.js';

@Injectable()
export class GetPackageUseCase {
  constructor(@Inject(PACKAGE_REPOSITORY) private packageRepository: IPackageRepository) {}

  async getPackageById(id: number): Promise<Package> {
    const pkg = await this.packageRepository.findPackageById(id);

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    return pkg;
  }
}
