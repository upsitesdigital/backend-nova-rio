export const ADMIN_REPOSITORY = Symbol('ADMIN_REPOSITORY');

export interface AdminData {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  status: string;
  refreshToken: string | null;
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
}
