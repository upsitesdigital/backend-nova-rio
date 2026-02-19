import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PACKAGE_REPOSITORY } from '../../../domain/interfaces/package.repository.interface.js';
import type { IPackageRepository } from '../../../domain/interfaces/package.repository.interface.js';

@Injectable()
export class ReactivatePackageUseCase {
  constructor(@Inject(PACKAGE_REPOSITORY) private packageRepository: IPackageRepository) {}

  async reactivatePackageById(id: number): Promise<void> {
    const existing = await this.packageRepository.findPackageByIdIncludingInactive(id);

    if (!existing) {
      throw new NotFoundException('Package not found');
    }

    await this.packageRepository.reactivatePackageById(id);
  }
}
