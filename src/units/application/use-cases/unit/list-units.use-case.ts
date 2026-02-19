import { Inject, Injectable } from '@nestjs/common';
import type { Unit } from '@prisma/client';
import { UNIT_REPOSITORY } from '../../../domain/interfaces/unit.repository.interface.js';
import type { IUnitRepository } from '../../../domain/interfaces/unit.repository.interface.js';

@Injectable()
export class ListUnitsUseCase {
  constructor(@Inject(UNIT_REPOSITORY) private unitRepository: IUnitRepository) {}

  async listUnits(): Promise<Unit[]> {
    return this.unitRepository.listUnits();
  }
}
