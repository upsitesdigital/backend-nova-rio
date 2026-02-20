import { Inject, Injectable } from '@nestjs/common';
import { CARD_REPOSITORY } from '../../../domain/interfaces/card.repository.interface.js';
import type {
  CardResponse,
  ICardRepository,
} from '../../../domain/interfaces/card.repository.interface.js';
import type { AddCardDto } from '../../../dto/card/add-card.dto.js';

@Injectable()
export class AddCardUseCase {
  constructor(@Inject(CARD_REPOSITORY) private cardRepository: ICardRepository) {}

  async addCard(clientId: number, dto: AddCardDto): Promise<CardResponse> {
    const data = { ...dto, clientId };

    if (dto.isDefault) {
      return this.cardRepository.createDefaultCard(data);
    }

    return this.cardRepository.createCard(data);
  }
}
