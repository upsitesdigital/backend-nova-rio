import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Package } from '@prisma/client';
import type { IServiceRepository } from '../../../../services/domain/interfaces/service.repository.interface.js';
import type { IPackageRepository } from '../../../domain/interfaces/package.repository.interface.js';
import type { UpdatePackageDto } from '../../../dto/package/update-package.dto.js';

@Injectable()
export class UpdatePackageUseCase {
  constructor(
    @Inject(DiTokens.packageRepository) private packageRepository: IPackageRepository,
    @Inject(DiTokens.serviceRepository) private serviceRepository: IServiceRepository,
  ) {}

  async updatePackageById(id: number, dto: UpdatePackageDto): Promise<Package> {
    const existing = await this.packageRepository.findPackageById(id);

    if (!existing) {
      throw new NotFoundException('Package not found');
    }

    if (dto.serviceId) {
      const service = await this.serviceRepository.findServiceById(dto.serviceId);

      if (!service) {
        throw new BadRequestException('Service not found or inactive');
      }
    }

    return this.packageRepository.updatePackageById(id, dto);
  }
}
