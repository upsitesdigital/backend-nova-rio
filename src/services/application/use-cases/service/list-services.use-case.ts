import { Inject, Injectable } from '@nestjs/common';
import type { Service } from '@prisma/client';
import { SERVICE_REPOSITORY } from '../../../domain/interfaces/service.repository.interface.js';
import type { IServiceRepository } from '../../../domain/interfaces/service.repository.interface.js';

@Injectable()
export class ListServicesUseCase {
  constructor(@Inject(SERVICE_REPOSITORY) private serviceRepository: IServiceRepository) {}

  async listActiveServices(): Promise<Service[]> {
    return this.serviceRepository.findAllActiveServices();
  }
}
