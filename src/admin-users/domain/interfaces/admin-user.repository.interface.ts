import type { AdminRole, UserStatus } from '@prisma/client';
import type { PaginatedResponse } from '../../../shared/types/paginated-response.type.js';

export interface AdminUserSafe {
  id: number;
  uuid: string;
  name: string;
  email: string;
  role: AdminRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  createdById: number | null;
}

export interface CreateAdminUserData {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
  createdById: number;
}

export interface ListAdminUsersFilters {
  status?: UserStatus;
  search?: string;
  page: number;
  limit: number;
}

export interface IAdminUserRepository {
  createAdminUser(data: CreateAdminUserData): Promise<AdminUserSafe>;
  findAdminUserByEmail(email: string): Promise<AdminUserSafe | null>;
  findAdminUserById(id: number): Promise<AdminUserSafe | null>;
  listAdminUsers(filters: ListAdminUsersFilters): Promise<PaginatedResponse<AdminUserSafe>>;
  deactivateAdminUserById(id: number): Promise<void>;
}
