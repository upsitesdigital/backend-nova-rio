import { Module } from '@nestjs/common';
import { AddCardUseCase } from './application/use-cases/card/add-card.use-case.js';
import { ListCardsUseCase } from './application/use-cases/card/list-cards.use-case.js';
import { RemoveCardUseCase } from './application/use-cases/card/remove-card.use-case.js';
import { SetDefaultCardUseCase } from './application/use-cases/card/set-default-card.use-case.js';
import { CardsController } from './cards.controller.js';
import { CARD_REPOSITORY } from './domain/interfaces/card.repository.interface.js';
import { PrismaCardRepository } from './infrastructure/repositories/prisma-card.repository.js';

@Module({
  controllers: [CardsController],
  providers: [
    { provide: CARD_REPOSITORY, useClass: PrismaCardRepository },
    AddCardUseCase,
    ListCardsUseCase,
    RemoveCardUseCase,
    SetDefaultCardUseCase,
  ],
  exports: [CARD_REPOSITORY],
})
export class CardsModule {}
