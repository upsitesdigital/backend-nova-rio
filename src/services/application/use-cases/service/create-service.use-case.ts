import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable } from '@nestjs/common';
import type { Service } from '@prisma/client';
import type { IServiceRepository } from '../../../domain/interfaces/service.repository.interface.js';
import type { CreateServiceDto } from '../../../dto/service/create-service.dto.js';

@Injectable()
export class CreateServiceUseCase {
  constructor(@Inject(DiTokens.serviceRepository) private serviceRepository: IServiceRepository) {}

  async createService(dto: CreateServiceDto): Promise<Service> {
    return this.serviceRepository.createService(dto);
  }
}
