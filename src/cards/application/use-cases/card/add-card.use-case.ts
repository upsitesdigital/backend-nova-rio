import { Inject, Injectable } from '@nestjs/common';
import creditCardType from 'credit-card-type';
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
    const digits = dto.cardNumber.replace(/\D/g, '');
    const lastFourDigits = digits.slice(-4);

    const detected = creditCardType(digits);
    const brand = detected.length > 0 ? detected[0].type : 'other';

    const data = {
      cardNumber: digits,
      lastFourDigits,
      brand,
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
