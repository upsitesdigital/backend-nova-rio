import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Service } from '@prisma/client';
import type { IServiceRepository } from '../../../domain/interfaces/service.repository.interface.js';

@Injectable()
export class GetServiceUseCase {
  constructor(@Inject(DiTokens.serviceRepository) private serviceRepository: IServiceRepository) {}

  async getServiceById(id: number): Promise<Service> {
    const service = await this.serviceRepository.findServiceById(id);

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }
}
