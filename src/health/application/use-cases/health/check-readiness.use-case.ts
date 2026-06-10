import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable } from '@nestjs/common';
import type { IHealthRepository } from '../../../domain/interfaces/health.repository.interface.js';

@Injectable()
export class CheckReadinessUseCase {
  constructor(
    @Inject(DiTokens.healthRepository)
    private readonly healthRepository: IHealthRepository,
  ) {}

  async checkReadiness(): Promise<void> {
    await this.healthRepository.pingDatabase();
  }
}
