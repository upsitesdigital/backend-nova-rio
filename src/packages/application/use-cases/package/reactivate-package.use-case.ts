import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IPackageRepository } from '../../../domain/interfaces/package.repository.interface.js';

@Injectable()
export class ReactivatePackageUseCase {
  constructor(@Inject(DiTokens.packageRepository) private packageRepository: IPackageRepository) {}

  async reactivatePackageById(id: number): Promise<void> {
    const existing = await this.packageRepository.findPackageByIdIncludingInactive(id);

    if (!existing) {
      throw new NotFoundException('Package not found');
    }

    await this.packageRepository.reactivatePackageById(id);
  }
}
