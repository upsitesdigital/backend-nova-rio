import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { Package } from '@prisma/client';
import type { PaginatedResponse } from '../../../../shared/types/paginated-response.type.js';
import { SERVICE_REPOSITORY } from '../../../../services/domain/interfaces/service.repository.interface.js';
import type { IServiceRepository } from '../../../../services/domain/interfaces/service.repository.interface.js';
import { PACKAGE_REPOSITORY } from '../../../domain/interfaces/package.repository.interface.js';
import type { IPackageRepository } from '../../../domain/interfaces/package.repository.interface.js';
import type { ListPackagesQueryDto } from '../../../dto/package/list-packages-query.dto.js';

@Injectable()
export class ListPackagesUseCase {
  constructor(
    @Inject(PACKAGE_REPOSITORY) private packageRepository: IPackageRepository,
    @Inject(SERVICE_REPOSITORY) private serviceRepository: IServiceRepository,
  ) {}

  async listPackages(query: ListPackagesQueryDto): Promise<PaginatedResponse<Package>> {
    if (query.serviceId) {
      const service = await this.serviceRepository.findServiceById(query.serviceId);

      if (!service) {
        throw new BadRequestException('Service not found or inactive');
      }
    }

    return this.packageRepository.findPackages({
      page: query.page!,
      limit: query.limit!,
      active: query.active,
      serviceId: query.serviceId,
    });
  }
}
