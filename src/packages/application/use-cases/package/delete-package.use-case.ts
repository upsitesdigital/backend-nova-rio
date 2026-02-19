import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PACKAGE_REPOSITORY } from '../../../domain/interfaces/package.repository.interface.js';
import type { IPackageRepository } from '../../../domain/interfaces/package.repository.interface.js';

@Injectable()
export class DeletePackageUseCase {
  constructor(@Inject(PACKAGE_REPOSITORY) private packageRepository: IPackageRepository) {}

  async deactivatePackageById(id: number): Promise<void> {
    const existing = await this.packageRepository.findPackageById(id);

    if (!existing) {
      throw new NotFoundException('Package not found');
    }

    await this.packageRepository.deactivatePackageById(id);
  }
}
