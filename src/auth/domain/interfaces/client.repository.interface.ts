import type { Client, VerificationCode } from '@prisma/client';

export const CLIENT_REPOSITORY = Symbol('CLIENT_REPOSITORY');

export type ClientData = Pick<
  Client,
  | 'id'
  | 'name'
  | 'email'
  | 'phone'
  | 'password'
  | 'avatarUrl'
  | 'company'
  | 'cpfCnpj'
  | 'address'
  | 'status'
  | 'refreshToken'
  | 'failedLoginAttempts'
  | 'lockedUntil'
  | 'tokenFamily'
  | 'createdAt'
>;

export type CreateClientData = Pick<Client, 'name' | 'email' | 'password'> & {
  phone?: string;
};

export type ClientProfile = Pick<
  Client,
  | 'id'
  | 'name'
  | 'email'
  | 'phone'
  | 'avatarUrl'
  | 'company'
  | 'cpfCnpj'
  | 'address'
  | 'status'
  | 'createdAt'
>;

export type VerificationCodeRecord = Pick<VerificationCode, 'id' | 'code' | 'expiresAt'>;

export interface IClientRepository {
  findByEmail(email: string): Promise<ClientData | null>;
  findById(id: number): Promise<ClientData | null>;
  findProfileById(id: number): Promise<ClientProfile | null>;
  create(data: CreateClientData): Promise<ClientData>;
  updateRefreshToken(id: number, refreshToken: string | null): Promise<void>;
  getRefreshToken(id: number): Promise<string | null>;
  incrementFailedLoginAttempts(id: number): Promise<void>;
  resetFailedLoginAttempts(id: number): Promise<void>;
  updateRefreshTokenWithFamily(
    id: number,
    refreshToken: string,
    tokenFamily: string,
  ): Promise<void>;
  getRefreshTokenAndFamily(
    id: number,
  ): Promise<{ refreshToken: string | null; tokenFamily: string | null }>;
  revokeTokenFamily(id: number): Promise<void>;
  createVerificationCode(
    clientId: number,
    code: string,
    type: string,
    channel: string,
    expiresAt: Date,
  ): Promise<void>;
  deleteVerificationCodesByClientId(clientId: number, type: string): Promise<void>;
  findActiveVerificationCodes(clientId: number, type: string): Promise<VerificationCodeRecord[]>;
  markVerificationCodeAsUsed(id: number): Promise<void>;
  updateEmail(id: number, email: string): Promise<void>;
  updatePassword(id: number, password: string): Promise<void>;
  deactivateClient(id: number): Promise<void>;
}
