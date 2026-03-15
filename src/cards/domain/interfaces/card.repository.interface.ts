import type { Card } from '@prisma/client';

export const CARD_REPOSITORY = Symbol('CARD_REPOSITORY');

export type CardResponse = Pick<
  Card,
  'id' | 'lastFourDigits' | 'brand' | 'holderName' | 'expiryMonth' | 'expiryYear' | 'isDefault'
>;

export interface CreateCardData {
  cardNumber: string;
  lastFourDigits: string;
  brand: string;
  holderName: string;
  expiryMonth: number;
  expiryYear: number;
  gatewayToken: string;
  isDefault?: boolean;
  clientId: number;
}

export interface ICardRepository {
  createCard(data: CreateCardData): Promise<CardResponse>;
  createDefaultCard(data: CreateCardData): Promise<CardResponse>;
  findCardsByClientId(clientId: number): Promise<CardResponse[]>;
  findCardByIdAndClientId(id: number, clientId: number): Promise<Card | null>;
  deleteCardById(id: number): Promise<void>;
  switchDefaultCardById(id: number, clientId: number): Promise<CardResponse>;
}
