import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { Package } from '@prisma/client';
import type { IServiceRepository } from '../../../../services/domain/interfaces/service.repository.interface.js';
import type { IPackageRepository } from '../../../domain/interfaces/package.repository.interface.js';
import type { CreatePackageDto } from '../../../dto/package/create-package.dto.js';

@Injectable()
export class CreatePackageUseCase {
  constructor(
    @Inject(DiTokens.packageRepository) private packageRepository: IPackageRepository,
    @Inject(DiTokens.serviceRepository) private serviceRepository: IServiceRepository,
  ) {}

  async createPackage(dto: CreatePackageDto): Promise<Package> {
    const service = await this.serviceRepository.findServiceById(dto.serviceId);

    if (!service) {
      throw new BadRequestException('Service not found or inactive');
    }

    return this.packageRepository.createPackage(dto);
  }
}
