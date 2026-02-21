import { Inject, Injectable } from '@nestjs/common';
import type { Service } from '@prisma/client';
import type { PaginatedResponse } from '../../../../shared/types/paginated-response.type.js';
import { SERVICE_REPOSITORY } from '../../../domain/interfaces/service.repository.interface.js';
import type { IServiceRepository } from '../../../domain/interfaces/service.repository.interface.js';
import type { ListServicesQueryDto } from '../../../dto/service/list-services-query.dto.js';

@Injectable()
export class ListServicesUseCase {
  constructor(@Inject(SERVICE_REPOSITORY) private serviceRepository: IServiceRepository) {}

  async listActiveServices(query: ListServicesQueryDto): Promise<PaginatedResponse<Service>> {
    return this.serviceRepository.findAllActiveServices({
      page: query.page!,
      limit: query.limit!,
    });
  }
}
