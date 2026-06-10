import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Unit } from '@prisma/client';
import type { IUnitRepository } from '../../../domain/interfaces/unit.repository.interface.js';
import { UpdateUnitDto } from '../../../dto/unit/update-unit.dto.js';

@Injectable()
export class UpdateUnitUseCase {
  constructor(@Inject(DiTokens.unitRepository) private unitRepository: IUnitRepository) {}

  async updateUnitById(id: number, dto: UpdateUnitDto): Promise<Unit> {
    const existing = await this.unitRepository.findUnitById(id);

    if (!existing) {
      throw new NotFoundException('Unit not found');
    }

    if (dto.name && dto.name !== existing.name) {
      const nameConflict = await this.unitRepository.findUnitByName(dto.name);

      if (nameConflict) {
        throw new ConflictException('Unit name already in use');
      }
    }

    return this.unitRepository.updateUnitById(id, dto);
  }
}
