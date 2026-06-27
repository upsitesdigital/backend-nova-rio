import type { Client, VerificationCode } from '@prisma/client';

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
  | 'preferredRecurrence'
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
  reserveLoginAttempt(id: number): Promise<boolean>;
  incrementFailedLoginAttempts(id: number): Promise<void>;
  resetFailedLoginAttempts(id: number): Promise<void>;
  updateRefreshToken(id: number, refreshToken: string | null): Promise<void>;
  getRefreshToken(id: number): Promise<string | null>;
  updateRefreshTokenWithFamily(
    id: number,
    refreshToken: string,
    tokenFamily: string,
    currentRefreshToken?: string,
  ): Promise<boolean>;
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
  markVerificationCodeAsUsed(id: number): Promise<boolean>;
  updateEmail(id: number, email: string): Promise<void>;
  updatePassword(id: number, password: string): Promise<void>;
  /**
   * Atomically consumes the verification code, sets the new password hash and
   * invalidates existing sessions by clearing `refreshToken`/`tokenFamily`,
   * forcing re-login after a reset.
   */
  completePasswordReset(
    clientId: number,
    verificationCodeId: number,
    hashedPassword: string,
  ): Promise<boolean>;
  getResetAttempts(
    clientId: number,
  ): Promise<{ failedResetAttempts: number; resetLockedUntil: Date | null }>;
  reserveResetAttempt(clientId: number): Promise<{ allowed: boolean; failedResetAttempts: number }>;
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
