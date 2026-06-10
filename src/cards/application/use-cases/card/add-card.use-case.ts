import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable } from '@nestjs/common';
import type {
  CardResponse,
  ICardRepository,
} from '../../../domain/interfaces/card.repository.interface.js';
import type { AddCardDto } from '../../../dto/card/add-card.dto.js';

@Injectable()
export class AddCardUseCase {
  constructor(@Inject(DiTokens.cardRepository) private cardRepository: ICardRepository) {}

  async addCard(clientId: number, dto: AddCardDto): Promise<CardResponse> {
    const data = {
      lastFourDigits: dto.lastFourDigits,
      brand: dto.brand,
      holderName: dto.holderName,
      expiryMonth: dto.expiryMonth,
      expiryYear: dto.expiryYear,
      gatewayToken: dto.gatewayToken,
      isDefault: dto.isDefault,
      clientId,
    };

    if (dto.isDefault) {
      return this.cardRepository.createDefaultCard(data);
    }

    return this.cardRepository.createCard(data);
  }
}
