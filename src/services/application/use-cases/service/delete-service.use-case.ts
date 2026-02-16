import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SERVICE_REPOSITORY } from '../../../domain/interfaces/service.repository.interface.js';
import type { IServiceRepository } from '../../../domain/interfaces/service.repository.interface.js';

@Injectable()
export class DeleteServiceUseCase {
  constructor(@Inject(SERVICE_REPOSITORY) private serviceRepository: IServiceRepository) {}

  async deactivateServiceById(id: number): Promise<void> {
    const existing = await this.serviceRepository.findServiceById(id);

    if (!existing) {
      throw new NotFoundException('Service not found');
    }

    await this.serviceRepository.deactivateServiceById(id);
  }
}
