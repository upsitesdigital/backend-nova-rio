import type { Client, VerificationCode } from '@prisma/client';

export const CLIENT_REPOSITORY = Symbol('CLIENT_REPOSITORY');
export const CLIENT_AUTH_REPOSITORY = Symbol('CLIENT_AUTH_REPOSITORY');
export const CLIENT_VERIFICATION_REPOSITORY = Symbol('CLIENT_VERIFICATION_REPOSITORY');
export const CLIENT_PROFILE_REPOSITORY = Symbol('CLIENT_PROFILE_REPOSITORY');

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

export type ClientForPayment = Pick<
  Client,
  'id' | 'name' | 'email' | 'cpfCnpj' | 'phone' | 'vindiCustomerId'
>;

/** Auth-focused methods: login flow, password, failed attempts, token management */
export interface IClientAuthRepository {
  findByEmail(email: string): Promise<ClientData | null>;
  findById(id: number): Promise<ClientData | null>;
  findStatusById(id: number): Promise<{ status: string } | null>;
  create(data: CreateClientData): Promise<ClientData>;
  incrementFailedLoginAttempts(id: number): Promise<void>;
  resetFailedLoginAttempts(id: number): Promise<void>;
  updateRefreshToken(id: number, refreshToken: string | null): Promise<void>;
  getRefreshToken(id: number): Promise<string | null>;
  updateRefreshTokenWithFamily(
    id: number,
    refreshToken: string,
    tokenFamily: string,
  ): Promise<void>;
  getRefreshTokenAndFamily(
    id: number,
  ): Promise<{ refreshToken: string | null; tokenFamily: string | null }>;
  revokeTokenFamily(id: number): Promise<void>;
}

/** Verification code lifecycle methods */
export interface IClientVerificationRepository {
  findById(id: number): Promise<ClientData | null>;
  findByEmail(email: string): Promise<ClientData | null>;
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
  completePasswordReset(clientId: number, hashedPassword: string): Promise<void>;
  getResetAttempts(
    clientId: number,
  ): Promise<{ failedResetAttempts: number; resetLockedUntil: Date | null }>;
  incrementResetAttempts(
    clientId: number,
    maxAttempts: number,
    lockoutWindowMs: number,
  ): Promise<void>;
  clearResetAttempts(clientId: number): Promise<void>;
}

/** Profile and account management methods */
export interface IClientProfileRepository {
  findById(id: number): Promise<ClientData | null>;
  findByEmail(email: string): Promise<ClientData | null>;
  findProfileById(id: number): Promise<ClientProfile | null>;
  findClientForPayment(id: number): Promise<ClientForPayment | null>;
  updateEmail(id: number, email: string): Promise<void>;
  updatePassword(id: number, password: string): Promise<void>;
  updateVindiCustomerId(id: number, vindiCustomerId: number): Promise<void>;
  deactivateClient(id: number): Promise<void>;
}

/** Combined interface — retained for backwards compatibility with the single DI token */
export interface IClientRepository
  extends IClientAuthRepository, IClientVerificationRepository, IClientProfileRepository {}
