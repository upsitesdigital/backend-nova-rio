import type { AdminUser } from '@prisma/client';

export const ADMIN_REPOSITORY = Symbol('ADMIN_REPOSITORY');
export const ADMIN_AUTH_REPOSITORY = Symbol('ADMIN_AUTH_REPOSITORY');
export const ADMIN_PROFILE_REPOSITORY = Symbol('ADMIN_PROFILE_REPOSITORY');

export type AdminData = Pick<
  AdminUser,
  | 'id'
  | 'name'
  | 'email'
  | 'password'
  | 'role'
  | 'status'
  | 'refreshToken'
  | 'failedLoginAttempts'
  | 'lockedUntil'
  | 'tokenFamily'
  | 'createdAt'
>;

export type AdminProfile = Pick<
  AdminUser,
  'id' | 'name' | 'email' | 'role' | 'status' | 'createdAt'
>;

/** Auth-focused methods: login flow, failed attempts, token management */
export interface IAdminAuthRepository {
  findByEmail(email: string): Promise<AdminData | null>;
  findById(id: number): Promise<AdminData | null>;
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

/** Profile lookup methods */
export interface IAdminProfileRepository {
  findById(id: number): Promise<AdminData | null>;
  findProfileById(id: number): Promise<AdminProfile | null>;
}

/** Combined interface — retained for backwards compatibility with the single DI token */
export interface IAdminRepository extends IAdminAuthRepository, IAdminProfileRepository {}
