import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CARD_REPOSITORY } from '../../../domain/interfaces/card.repository.interface.js';
import type { ICardRepository } from '../../../domain/interfaces/card.repository.interface.js';

@Injectable()
export class RemoveCardUseCase {
  constructor(@Inject(CARD_REPOSITORY) private cardRepository: ICardRepository) {}

  async removeCardByIdAndClientId(id: number, clientId: number): Promise<void> {
    const card = await this.cardRepository.findCardByIdAndClientId(id, clientId);

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    await this.cardRepository.deleteCardById(id);
  }
}
