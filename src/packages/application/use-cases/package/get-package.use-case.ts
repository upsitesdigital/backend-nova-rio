import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Package } from '@prisma/client';
import type { IPackageRepository } from '../../../domain/interfaces/package.repository.interface.js';

@Injectable()
export class GetPackageUseCase {
  constructor(@Inject(DiTokens.packageRepository) private packageRepository: IPackageRepository) {}

  async getPackageById(id: number): Promise<Package> {
    const pkg = await this.packageRepository.findPackageById(id);

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    return pkg;
  }
}
