import { Inject, Injectable } from '@nestjs/common';
import type { Service } from '@prisma/client';
import { SERVICE_REPOSITORY } from '../../../domain/interfaces/service.repository.interface.js';
import type { IServiceRepository } from '../../../domain/interfaces/service.repository.interface.js';
import { CreateServiceDto } from '../../../dto/service/create-service.dto.js';

@Injectable()
export class CreateServiceUseCase {
  constructor(@Inject(SERVICE_REPOSITORY) private serviceRepository: IServiceRepository) {}

  async createService(dto: CreateServiceDto): Promise<Service> {
    return this.serviceRepository.createService(dto);
  }
}
