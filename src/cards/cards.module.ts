import { DiTokens } from '../shared/di/di-tokens.js';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { AddCardUseCase } from './application/use-cases/card/add-card.use-case.js';
import { ListCardsUseCase } from './application/use-cases/card/list-cards.use-case.js';
import { RemoveCardUseCase } from './application/use-cases/card/remove-card.use-case.js';
import { SetDefaultCardUseCase } from './application/use-cases/card/set-default-card.use-case.js';
import { CardsController } from './cards.controller.js';
import { PrismaCardRepository } from './infrastructure/repositories/prisma-card.repository.js';

@Module({
  imports: [AuthModule],
  controllers: [CardsController],
  providers: [
    { provide: DiTokens.cardRepository, useClass: PrismaCardRepository },
    AddCardUseCase,
    ListCardsUseCase,
    RemoveCardUseCase,
    SetDefaultCardUseCase,
  ],
  exports: [DiTokens.cardRepository],
})
export class CardsModule {}
