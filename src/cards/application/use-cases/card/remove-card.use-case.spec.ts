import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { RemoveCardUseCase } from './remove-card.use-case.js';

describe('RemoveCardUseCase', () => {
  let useCase: RemoveCardUseCase;
  let cardRepository: { findCardByIdAndClientId: Mock; deleteCardById: Mock };

  beforeEach(async () => {
    cardRepository = {
      findCardByIdAndClientId: vi.fn(),
      deleteCardById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveCardUseCase,
        { provide: DiTokens.cardRepository, useValue: cardRepository },
      ],
    }).compile();

    useCase = module.get<RemoveCardUseCase>(RemoveCardUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should delete a card when it belongs to the client', async () => {
    const card = { id: 1, clientId: 1, brand: 'Visa' };

    cardRepository.findCardByIdAndClientId.mockResolvedValue(card);
    cardRepository.deleteCardById.mockResolvedValue(undefined);

    await useCase.removeCardByIdAndClientId(1, 1);

    expect(cardRepository.findCardByIdAndClientId).toHaveBeenCalledWith(1, 1);
    expect(cardRepository.deleteCardById).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException if card not found', async () => {
    cardRepository.findCardByIdAndClientId.mockResolvedValue(null);

    await expect(useCase.removeCardByIdAndClientId(999, 1)).rejects.toThrow(NotFoundException);
    expect(cardRepository.deleteCardById).not.toHaveBeenCalled();
  });
});
