import type { Card } from '@prisma/client';

export type CardResponse = Pick<
  Card,
  'id' | 'lastFourDigits' | 'brand' | 'holderName' | 'expiryMonth' | 'expiryYear' | 'isDefault'
>;

export interface CreateCardData {
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
  findCardByIdAndClientId(id: number, clientId: number): Promise<CardResponse | null>;
  deleteCardByIdAndClientId(id: number, clientId: number): Promise<boolean>;
  switchDefaultCardByIdAndClientId(id: number, clientId: number): Promise<CardResponse | null>;
}
