import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CARD_REPOSITORY } from '../../../domain/interfaces/card.repository.interface.js';
import type {
  CardResponse,
  ICardRepository,
} from '../../../domain/interfaces/card.repository.interface.js';

@Injectable()
export class SetDefaultCardUseCase {
  constructor(@Inject(CARD_REPOSITORY) private cardRepository: ICardRepository) {}

  async setDefaultCardByIdAndClientId(id: number, clientId: number): Promise<CardResponse> {
    const card = await this.cardRepository.findCardByIdAndClientId(id, clientId);

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    return this.cardRepository.switchDefaultCardById(id, clientId);
  }
}
