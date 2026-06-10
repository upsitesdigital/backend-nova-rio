import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable } from '@nestjs/common';
import type {
  CardResponse,
  ICardRepository,
} from '../../../domain/interfaces/card.repository.interface.js';

@Injectable()
export class ListCardsUseCase {
  constructor(@Inject(DiTokens.cardRepository) private cardRepository: ICardRepository) {}

  async listCardsByClientId(clientId: number): Promise<CardResponse[]> {
    return this.cardRepository.findCardsByClientId(clientId);
  }
}
