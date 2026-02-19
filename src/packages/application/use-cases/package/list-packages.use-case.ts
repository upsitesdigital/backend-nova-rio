import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { Package } from '@prisma/client';
import { SERVICE_REPOSITORY } from '../../../../services/domain/interfaces/service.repository.interface.js';
import type { IServiceRepository } from '../../../../services/domain/interfaces/service.repository.interface.js';
import { PACKAGE_REPOSITORY } from '../../../domain/interfaces/package.repository.interface.js';
import type { IPackageRepository } from '../../../domain/interfaces/package.repository.interface.js';

@Injectable()
export class ListPackagesUseCase {
  constructor(
    @Inject(PACKAGE_REPOSITORY) private packageRepository: IPackageRepository,
    @Inject(SERVICE_REPOSITORY) private serviceRepository: IServiceRepository,
  ) {}

  async listPackages(active?: boolean, serviceId?: number): Promise<Package[]> {
    if (serviceId) {
      const service = await this.serviceRepository.findServiceById(serviceId);

      if (!service) {
        throw new BadRequestException('Service not found or inactive');
      }
    }

    return this.packageRepository.findPackages({ active, serviceId });
  }
}
