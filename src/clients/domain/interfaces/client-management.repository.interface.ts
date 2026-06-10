import type { UserStatus } from '@prisma/client';
import type { PaginatedResponse } from '../../../shared/types/paginated-response.type.js';

export interface ClientSafe {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  company: string | null;
  cpfCnpj: string | null;
  address: string | null;
  complement: string | null;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  unit: { id: number; name: string } | null;
}

export interface ListClientsFilters {
  status?: UserStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IClientManagementRepository {
  listClients(filters: ListClientsFilters): Promise<PaginatedResponse<ClientSafe>>;
  findClientById(id: number): Promise<ClientSafe | null>;
  approveClientById(id: number): Promise<boolean>;
  rejectClientById(id: number): Promise<boolean>;
}
