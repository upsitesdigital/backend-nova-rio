import type { AdminUser } from '@prisma/client';

export const ADMIN_REPOSITORY = Symbol('ADMIN_REPOSITORY');

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

export interface IAdminRepository {
  findByEmail(email: string): Promise<AdminData | null>;
  findById(id: number): Promise<AdminData | null>;
  findProfileById(id: number): Promise<AdminProfile | null>;
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
}
