import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { CARD_REPOSITORY } from '../../../domain/interfaces/card.repository.interface.js';
import { ListCardsUseCase } from './list-cards.use-case.js';

describe('ListCardsUseCase', () => {
  let useCase: ListCardsUseCase;
  let cardRepository: { findCardsByClientId: Mock };

  beforeEach(async () => {
    cardRepository = {
      findCardsByClientId: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ListCardsUseCase, { provide: CARD_REPOSITORY, useValue: cardRepository }],
    }).compile();

    useCase = module.get<ListCardsUseCase>(ListCardsUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return cards for the given clientId', async () => {
    const cards = [
      { id: 1, clientId: 1, brand: 'Visa', lastFourDigits: '4242' },
      { id: 2, clientId: 1, brand: 'Mastercard', lastFourDigits: '5555' },
    ];

    cardRepository.findCardsByClientId.mockResolvedValue(cards);

    const result = await useCase.listCardsByClientId(1);

    expect(result).toEqual(cards);
    expect(cardRepository.findCardsByClientId).toHaveBeenCalledWith(1);
  });
});
