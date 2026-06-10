import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Service } from '@prisma/client';
import type { IServiceRepository } from '../../../domain/interfaces/service.repository.interface.js';
import type { UpdateServiceDto } from '../../../dto/service/update-service.dto.js';

@Injectable()
export class UpdateServiceUseCase {
  constructor(@Inject(DiTokens.serviceRepository) private serviceRepository: IServiceRepository) {}

  async updateServiceById(id: number, dto: UpdateServiceDto): Promise<Service> {
    const existing = await this.serviceRepository.findServiceById(id);

    if (!existing) {
      throw new NotFoundException('Service not found');
    }

    return this.serviceRepository.updateServiceById(id, dto);
  }
}
