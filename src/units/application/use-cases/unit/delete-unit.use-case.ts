import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IUnitRepository } from '../../../domain/interfaces/unit.repository.interface.js';

@Injectable()
export class DeleteUnitUseCase {
  constructor(@Inject(DiTokens.unitRepository) private unitRepository: IUnitRepository) {}

  async deleteUnitById(id: number): Promise<void> {
    const existing = await this.unitRepository.findUnitById(id);

    if (!existing) {
      throw new NotFoundException('Unit not found');
    }

    await this.unitRepository.deleteUnitById(id);
  }
}
