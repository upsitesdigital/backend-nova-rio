import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { CARD_REPOSITORY } from '../../../domain/interfaces/card.repository.interface.js';
import { AddCardUseCase } from './add-card.use-case.js';

describe('AddCardUseCase', () => {
  let useCase: AddCardUseCase;
  let cardRepository: { createCard: Mock; createDefaultCard: Mock };

  beforeEach(async () => {
    cardRepository = {
      createCard: vi.fn(),
      createDefaultCard: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AddCardUseCase, { provide: CARD_REPOSITORY, useValue: cardRepository }],
    }).compile();

    useCase = module.get<AddCardUseCase>(AddCardUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should call createCard when isDefault is not set', async () => {
    const dto = {
      lastFourDigits: '1111',
      brand: 'visa',
      holderName: 'Joao',
      expiryMonth: 12,
      expiryYear: 2028,
      gatewayToken: 'tok_abc',
    };
    const created = {
      id: 1,
      lastFourDigits: '1111',
      brand: 'visa',
      holderName: 'Joao',
      expiryMonth: 12,
      expiryYear: 2028,
      isDefault: false,
    };

    cardRepository.createCard.mockResolvedValue(created);

    const result = await useCase.addCard(1, dto);

    expect(result).toEqual(created);
    expect(cardRepository.createDefaultCard).not.toHaveBeenCalled();
    expect(cardRepository.createCard).toHaveBeenCalledWith({
      lastFourDigits: '1111',
      brand: 'visa',
      holderName: 'Joao',
      expiryMonth: 12,
      expiryYear: 2028,
      gatewayToken: 'tok_abc',
      isDefault: undefined,
      clientId: 1,
    });
  });

  it('should call createDefaultCard when isDefault is true', async () => {
    const dto = {
      lastFourDigits: '0004',
      brand: 'mastercard',
      holderName: 'Joao',
      expiryMonth: 12,
      expiryYear: 2028,
      gatewayToken: 'tok_abc',
      isDefault: true,
    };
    const created = {
      id: 1,
      lastFourDigits: '0004',
      brand: 'mastercard',
      holderName: 'Joao',
      expiryMonth: 12,
      expiryYear: 2028,
      isDefault: true,
    };

    cardRepository.createDefaultCard.mockResolvedValue(created);

    const result = await useCase.addCard(1, dto);

    expect(result).toEqual(created);
    expect(cardRepository.createCard).not.toHaveBeenCalled();
    expect(cardRepository.createDefaultCard).toHaveBeenCalledWith({
      lastFourDigits: '0004',
      brand: 'mastercard',
      holderName: 'Joao',
      expiryMonth: 12,
      expiryYear: 2028,
      gatewayToken: 'tok_abc',
      isDefault: true,
      clientId: 1,
    });
  });
});
