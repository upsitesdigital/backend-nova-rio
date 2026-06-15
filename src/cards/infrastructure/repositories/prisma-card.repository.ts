import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type {
  CardResponse,
  CreateCardData,
  ICardRepository,
} from '../../domain/interfaces/card.repository.interface.js';

class CardQueryConfig {
  static readonly responseSelect = {
    id: true,
    lastFourDigits: true,
    brand: true,
    holderName: true,
    expiryMonth: true,
    expiryYear: true,
    isDefault: true,
  } as const;
}

@Injectable()
export class PrismaCardRepository implements ICardRepository {
  constructor(private prisma: PrismaService) {}

  async createCard(data: CreateCardData): Promise<CardResponse> {
    return this.prisma.card.create({
      data,
      select: CardQueryConfig.responseSelect,
    });
  }

  async createDefaultCard(data: CreateCardData): Promise<CardResponse> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM cards WHERE "clientId" = ${data.clientId} FOR UPDATE`;
        await tx.card.updateMany({
          where: { clientId: data.clientId, isDefault: true },
          data: { isDefault: false },
        });
        return tx.card.create({
          data: { ...data, isDefault: true },
          select: CardQueryConfig.responseSelect,
        });
      });
    } catch (error) {
      this.rethrowDefaultCardConflict(error);
      throw error;
    }
  }

  async findCardsByClientId(clientId: number): Promise<CardResponse[]> {
    return this.prisma.card.findMany({
      where: { clientId },
      select: CardQueryConfig.responseSelect,
    });
  }

  async findCardByIdAndClientId(id: number, clientId: number): Promise<CardResponse | null> {
    return this.prisma.card.findFirst({
      where: { id, clientId },
      select: CardQueryConfig.responseSelect,
    });
  }

  async deleteCardByIdAndClientId(id: number, clientId: number): Promise<boolean> {
    const deleted = await this.prisma.card.deleteMany({
      where: { id, clientId },
    });

    return deleted.count === 1;
  }

  async switchDefaultCardByIdAndClientId(
    id: number,
    clientId: number,
  ): Promise<CardResponse | null> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM cards WHERE "clientId" = ${clientId} FOR UPDATE`;
        await tx.card.updateMany({
          where: { clientId, isDefault: true },
          data: { isDefault: false },
        });

        const updated = await tx.card.updateMany({
          where: { id, clientId },
          data: { isDefault: true },
        });

        if (updated.count !== 1) {
          return null;
        }

        return tx.card.findFirst({
          where: { id, clientId },
          select: CardQueryConfig.responseSelect,
        });
      });
    } catch (error) {
      this.rethrowDefaultCardConflict(error);
      throw error;
    }
  }

  private rethrowDefaultCardConflict(error: unknown): never | void {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
      return;
    }

    if (error.code === 'P2002') {
      const target = Array.isArray(error.meta?.target) ? error.meta.target.join(',') : '';

      if (target.includes('cards_one_default_per_client')) {
        throw new ConflictException('Another default card was set. Try again.');
      }
    }
  }
}
