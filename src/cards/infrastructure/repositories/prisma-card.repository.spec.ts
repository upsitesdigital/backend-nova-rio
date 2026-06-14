import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import { PrismaCardRepository } from './prisma-card.repository.js';

const CARD_RESPONSE_SELECT = {
  id: true,
  lastFourDigits: true,
  brand: true,
  holderName: true,
  expiryMonth: true,
  expiryYear: true,
  isDefault: true,
};

describe('PrismaCardRepository', () => {
  let repository: PrismaCardRepository;
  let prisma: {
    card: {
      create: Mock;
      findMany: Mock;
      findFirst: Mock;
      deleteMany: Mock;
      updateMany: Mock;
    };
    $transaction: Mock;
    $queryRaw: Mock;
  };

  beforeEach(async () => {
    prisma = {
      card: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        deleteMany: vi.fn(),
        updateMany: vi.fn(),
      },
      $transaction: vi.fn(),
      $queryRaw: vi.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaCardRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repository = module.get<PrismaCardRepository>(PrismaCardRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('createCard should call prisma.card.create with data and select', async () => {
    const data = {
      lastFourDigits: '4242',
      brand: 'visa',
      holderName: 'João Silva',
      expiryMonth: 12,
      expiryYear: 2028,
      gatewayToken: 'tok_abc',
      clientId: 1,
    };
    const created = {
      id: 1,
      lastFourDigits: '4242',
      brand: 'Visa',
      holderName: 'João Silva',
      expiryMonth: 12,
      expiryYear: 2028,
      isDefault: false,
    };

    prisma.card.create.mockResolvedValue(created);

    const result = await repository.createCard(data);

    expect(result).toEqual(created);
    expect(prisma.card.create).toHaveBeenCalledWith({
      data,
      select: CARD_RESPONSE_SELECT,
    });
  });

  it('createDefaultCard should unset defaults and create in transaction', async () => {
    const data = {
      lastFourDigits: '4242',
      brand: 'visa',
      holderName: 'João Silva',
      expiryMonth: 12,
      expiryYear: 2028,
      gatewayToken: 'tok_abc',
      clientId: 1,
    };
    const created = {
      id: 1,
      lastFourDigits: '4242',
      brand: 'Visa',
      holderName: 'João Silva',
      expiryMonth: 12,
      expiryYear: 2028,
      isDefault: true,
    };

    prisma.$transaction.mockImplementation(async (fn: (tx: typeof prisma) => Promise<unknown>) => {
      return fn(prisma);
    });
    prisma.card.updateMany.mockResolvedValue({ count: 1 });
    prisma.card.create.mockResolvedValue(created);

    const result = await repository.createDefaultCard(data);

    expect(result).toEqual(created);
    expect(prisma.card.create).toHaveBeenCalledWith({
      data: { ...data, isDefault: true },
      select: CARD_RESPONSE_SELECT,
    });
  });

  it('findCardsByClientId should filter by clientId with select', async () => {
    const cards = [
      {
        id: 1,
        lastFourDigits: '4242',
        brand: 'Visa',
        holderName: 'João',
        expiryMonth: 12,
        expiryYear: 2028,
        isDefault: false,
      },
    ];

    prisma.card.findMany.mockResolvedValue(cards);

    const result = await repository.findCardsByClientId(1);

    expect(result).toEqual(cards);
    expect(prisma.card.findMany).toHaveBeenCalledWith({
      where: { clientId: 1 },
      select: CARD_RESPONSE_SELECT,
    });
  });

  it('findCardByIdAndClientId should return card', async () => {
    const card = { id: 1, clientId: 1, brand: 'Visa', gatewayToken: 'tok_abc' };
    prisma.card.findFirst.mockResolvedValue(card);

    const result = await repository.findCardByIdAndClientId(1, 1);

    expect(result).toEqual(card);
  });

  it('findCardByIdAndClientId should return null when not found', async () => {
    prisma.card.findFirst.mockResolvedValue(null);

    const result = await repository.findCardByIdAndClientId(999, 1);

    expect(result).toBeNull();
  });

  it('deleteCardByIdAndClientId should delete only the owner card', async () => {
    prisma.card.deleteMany.mockResolvedValue({ count: 1 });

    const result = await repository.deleteCardByIdAndClientId(1, 99);

    expect(result).toBe(true);
    expect(prisma.card.deleteMany).toHaveBeenCalledWith({
      where: { id: 1, clientId: 99 },
    });
  });

  it('switchDefaultCardByIdAndClientId should unset defaults and set new default in a transaction with select', async () => {
    const updated = {
      id: 1,
      lastFourDigits: '4242',
      brand: 'Visa',
      holderName: 'João',
      expiryMonth: 12,
      expiryYear: 2028,
      isDefault: true,
    };

    prisma.$transaction.mockImplementation(async (fn: (tx: typeof prisma) => Promise<unknown>) => {
      return fn(prisma);
    });
    prisma.card.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 1 });
    prisma.card.findFirst.mockResolvedValue(updated);

    const result = await repository.switchDefaultCardByIdAndClientId(1, 1);

    expect(result).toEqual(updated);
    expect(prisma.card.updateMany).toHaveBeenNthCalledWith(2, {
      where: { id: 1, clientId: 1 },
      data: { isDefault: true },
    });
    expect(prisma.card.findFirst).toHaveBeenCalledWith({
      where: { id: 1, clientId: 1 },
      select: CARD_RESPONSE_SELECT,
    });
  });

  it('createDefaultCard should translate default-card unique conflicts into ConflictException', async () => {
    prisma.$transaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('unique constraint', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['cards_one_default_per_client'] },
      }),
    );

    await expect(
      repository.createDefaultCard({
        lastFourDigits: '4242',
        brand: 'visa',
        holderName: 'João Silva',
        expiryMonth: 12,
        expiryYear: 2028,
        gatewayToken: 'tok_abc',
        clientId: 1,
      }),
    ).rejects.toThrow(new ConflictException('Another default card was set. Try again.'));
  });
});
