import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Service } from '@prisma/client';
import { SERVICE_REPOSITORY } from '../../../domain/interfaces/service.repository.interface.js';
import type { IServiceRepository } from '../../../domain/interfaces/service.repository.interface.js';

@Injectable()
export class GetServiceUseCase {
  constructor(@Inject(SERVICE_REPOSITORY) private serviceRepository: IServiceRepository) {}

  async getServiceById(id: number): Promise<Service> {
    const service = await this.serviceRepository.findServiceById(id);

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }
}
