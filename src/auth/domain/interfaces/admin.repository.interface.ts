export const ADMIN_REPOSITORY = Symbol('ADMIN_REPOSITORY');

export interface AdminData {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  status: string;
  refreshToken: string | null;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  tokenFamily: string | null;
  createdAt: Date;
}

export interface AdminProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
}

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
