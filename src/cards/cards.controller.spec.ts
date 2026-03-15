import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import type { AuthUser } from '../shared/types/auth-user.type.js';
import { CardsController } from './cards.controller.js';
import { AddCardUseCase } from './application/use-cases/card/add-card.use-case.js';
import { ListCardsUseCase } from './application/use-cases/card/list-cards.use-case.js';
import { RemoveCardUseCase } from './application/use-cases/card/remove-card.use-case.js';
import { SetDefaultCardUseCase } from './application/use-cases/card/set-default-card.use-case.js';

describe('CardsController', () => {
  let controller: CardsController;
  let addCardUseCase: { addCard: Mock };
  let listCardsUseCase: { listCardsByClientId: Mock };
  let removeCardUseCase: { removeCardByIdAndClientId: Mock };
  let setDefaultCardUseCase: { setDefaultCardByIdAndClientId: Mock };

  const clientUser: AuthUser = { id: 1, email: 'client@test.com', type: 'client' };

  beforeEach(async () => {
    addCardUseCase = { addCard: vi.fn() };
    listCardsUseCase = { listCardsByClientId: vi.fn() };
    removeCardUseCase = { removeCardByIdAndClientId: vi.fn() };
    setDefaultCardUseCase = { setDefaultCardByIdAndClientId: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardsController],
      providers: [
        { provide: AddCardUseCase, useValue: addCardUseCase },
        { provide: ListCardsUseCase, useValue: listCardsUseCase },
        { provide: RemoveCardUseCase, useValue: removeCardUseCase },
        { provide: SetDefaultCardUseCase, useValue: setDefaultCardUseCase },
      ],
    }).compile();

    controller = module.get<CardsController>(CardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('addCard should call addCardUseCase', async () => {
    const dto = {
      cardNumber: '4111111111111111',
      holderName: 'João',
      expiryMonth: 12,
      expiryYear: 2028,
      gatewayToken: 'tok_abc',
    };
    await controller.addCard(clientUser, dto);
    expect(addCardUseCase.addCard).toHaveBeenCalledWith(1, dto);
  });

  it('listCards should call listCardsUseCase', async () => {
    await controller.listCards(clientUser);
    expect(listCardsUseCase.listCardsByClientId).toHaveBeenCalledWith(1);
  });

  it('removeCard should call removeCardUseCase', async () => {
    await controller.removeCard(clientUser, 5);
    expect(removeCardUseCase.removeCardByIdAndClientId).toHaveBeenCalledWith(5, 1);
  });

  it('setDefaultCard should call setDefaultCardUseCase', async () => {
    await controller.setDefaultCard(clientUser, 5);
    expect(setDefaultCardUseCase.setDefaultCardByIdAndClientId).toHaveBeenCalledWith(5, 1);
  });
});
