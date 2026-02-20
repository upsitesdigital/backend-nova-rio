import { Inject, Injectable } from '@nestjs/common';
import { CARD_REPOSITORY } from '../../../domain/interfaces/card.repository.interface.js';
import type {
  CardResponse,
  ICardRepository,
} from '../../../domain/interfaces/card.repository.interface.js';

@Injectable()
export class ListCardsUseCase {
  constructor(@Inject(CARD_REPOSITORY) private cardRepository: ICardRepository) {}

  async listCardsByClientId(clientId: number): Promise<CardResponse[]> {
    return this.cardRepository.findCardsByClientId(clientId);
  }
}
