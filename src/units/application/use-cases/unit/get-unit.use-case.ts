import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Unit } from '@prisma/client';
import type { IUnitRepository } from '../../../domain/interfaces/unit.repository.interface.js';

@Injectable()
export class GetUnitUseCase {
  constructor(@Inject(DiTokens.unitRepository) private unitRepository: IUnitRepository) {}

  async getUnitById(id: number): Promise<Unit> {
    const unit = await this.unitRepository.findUnitById(id);

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    return unit;
  }
}
