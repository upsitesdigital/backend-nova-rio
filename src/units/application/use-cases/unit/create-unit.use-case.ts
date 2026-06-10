import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { Unit } from '@prisma/client';
import type { IUnitRepository } from '../../../domain/interfaces/unit.repository.interface.js';
import type { CreateUnitDto } from '../../../dto/unit/create-unit.dto.js';

@Injectable()
export class CreateUnitUseCase {
  constructor(@Inject(DiTokens.unitRepository) private unitRepository: IUnitRepository) {}

  async createUnit(dto: CreateUnitDto): Promise<Unit> {
    const existing = await this.unitRepository.findUnitByName(dto.name);

    if (existing) {
      throw new ConflictException('Unit name already in use');
    }

    return this.unitRepository.createUnit(dto);
  }
}
