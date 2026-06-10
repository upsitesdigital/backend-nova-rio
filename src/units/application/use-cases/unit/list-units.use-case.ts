import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable } from '@nestjs/common';
import type { Unit } from '@prisma/client';
import type { PaginatedResponse } from '../../../../shared/types/paginated-response.type.js';
import type { IUnitRepository } from '../../../domain/interfaces/unit.repository.interface.js';
import type { ListUnitsQueryDto } from '../../../dto/unit/list-units-query.dto.js';

@Injectable()
export class ListUnitsUseCase {
  constructor(@Inject(DiTokens.unitRepository) private unitRepository: IUnitRepository) {}

  async listUnits(query: ListUnitsQueryDto): Promise<PaginatedResponse<Unit>> {
    return this.unitRepository.listUnits({
      page: query.page!,
      limit: query.limit!,
    });
  }
}
