import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { SetDefaultCardUseCase } from './set-default-card.use-case.js';

describe('SetDefaultCardUseCase', () => {
  let useCase: SetDefaultCardUseCase;
  let cardRepository: {
    findCardByIdAndClientId: Mock;
    switchDefaultCardById: Mock;
  };

  beforeEach(async () => {
    cardRepository = {
      findCardByIdAndClientId: vi.fn(),
      switchDefaultCardById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SetDefaultCardUseCase,
        { provide: DiTokens.cardRepository, useValue: cardRepository },
      ],
    }).compile();

    useCase = module.get<SetDefaultCardUseCase>(SetDefaultCardUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should validate ownership and switch default card', async () => {
    const card = { id: 1, clientId: 1, brand: 'Visa', isDefault: false };
    const updated = {
      id: 1,
      lastFourDigits: '4242',
      brand: 'Visa',
      holderName: 'João',
      expiryMonth: 12,
      expiryYear: 2028,
      isDefault: true,
    };

    cardRepository.findCardByIdAndClientId.mockResolvedValue(card);
    cardRepository.switchDefaultCardById.mockResolvedValue(updated);

    const result = await useCase.setDefaultCardByIdAndClientId(1, 1);

    expect(result).toEqual(updated);
    expect(cardRepository.findCardByIdAndClientId).toHaveBeenCalledWith(1, 1);
    expect(cardRepository.switchDefaultCardById).toHaveBeenCalledWith(1, 1);
  });

  it('should throw NotFoundException if card not found', async () => {
    cardRepository.findCardByIdAndClientId.mockResolvedValue(null);

    await expect(useCase.setDefaultCardByIdAndClientId(999, 1)).rejects.toThrow(NotFoundException);
    expect(cardRepository.switchDefaultCardById).not.toHaveBeenCalled();
  });
});
