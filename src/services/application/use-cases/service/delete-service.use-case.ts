import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IServiceRepository } from '../../../domain/interfaces/service.repository.interface.js';

@Injectable()
export class DeleteServiceUseCase {
  constructor(@Inject(DiTokens.serviceRepository) private serviceRepository: IServiceRepository) {}

  async deactivateServiceById(id: number): Promise<void> {
    const existing = await this.serviceRepository.findServiceById(id);

    if (!existing) {
      throw new NotFoundException('Service not found');
    }

    await this.serviceRepository.deactivateServiceById(id);
  }
}
