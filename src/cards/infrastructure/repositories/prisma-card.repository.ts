import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type {
  CardResponse,
  CreateCardData,
  ICardRepository,
} from '../../domain/interfaces/card.repository.interface.js';

const CARD_RESPONSE_SELECT = {
  id: true,
  lastFourDigits: true,
  brand: true,
  holderName: true,
  expiryMonth: true,
  expiryYear: true,
  isDefault: true,
} as const;

@Injectable()
export class PrismaCardRepository implements ICardRepository {
  constructor(private prisma: PrismaService) {}

  async createCard(data: CreateCardData): Promise<CardResponse> {
    return this.prisma.card.create({
      data,
      select: CARD_RESPONSE_SELECT,
    });
  }

  async createDefaultCard(data: CreateCardData): Promise<CardResponse> {
    return this.prisma.$transaction(async (tx) => {
      await tx.card.updateMany({
        where: { clientId: data.clientId, isDefault: true },
        data: { isDefault: false },
      });
      return tx.card.create({
        data: { ...data, isDefault: true },
        select: CARD_RESPONSE_SELECT,
      });
    });
  }

  async findCardsByClientId(clientId: number): Promise<CardResponse[]> {
    return this.prisma.card.findMany({ where: { clientId }, select: CARD_RESPONSE_SELECT });
  }

  async findCardByIdAndClientId(id: number, clientId: number): Promise<CardResponse | null> {
    return this.prisma.card.findFirst({ where: { id, clientId }, select: CARD_RESPONSE_SELECT });
  }

  async deleteCardById(id: number): Promise<void> {
    await this.prisma.card.delete({ where: { id } });
  }

  async switchDefaultCardById(id: number, clientId: number): Promise<CardResponse> {
    return this.prisma.$transaction(async (tx) => {
      await tx.card.updateMany({
        where: { clientId, isDefault: true },
        data: { isDefault: false },
      });
      return tx.card.update({
        where: { id },
        data: { isDefault: true },
        select: CARD_RESPONSE_SELECT,
      });
    });
  }
}
