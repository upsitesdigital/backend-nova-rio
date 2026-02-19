import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { Unit } from '@prisma/client';
import { UNIT_REPOSITORY } from '../../../domain/interfaces/unit.repository.interface.js';
import type { IUnitRepository } from '../../../domain/interfaces/unit.repository.interface.js';
import { CreateUnitDto } from '../../../dto/unit/create-unit.dto.js';

@Injectable()
export class CreateUnitUseCase {
  constructor(@Inject(UNIT_REPOSITORY) private unitRepository: IUnitRepository) {}

  async createUnit(dto: CreateUnitDto): Promise<Unit> {
    const existing = await this.unitRepository.findUnitByName(dto.name);

    if (existing) {
      throw new ConflictException('Unit name already in use');
    }

    return this.unitRepository.createUnit(dto);
  }
}
