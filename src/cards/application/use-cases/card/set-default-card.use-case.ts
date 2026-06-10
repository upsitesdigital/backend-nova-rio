import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  CardResponse,
  ICardRepository,
} from '../../../domain/interfaces/card.repository.interface.js';

@Injectable()
export class SetDefaultCardUseCase {
  constructor(@Inject(DiTokens.cardRepository) private cardRepository: ICardRepository) {}

  async setDefaultCardByIdAndClientId(id: number, clientId: number): Promise<CardResponse> {
    const card = await this.cardRepository.findCardByIdAndClientId(id, clientId);

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    return this.cardRepository.switchDefaultCardById(id, clientId);
  }
}
