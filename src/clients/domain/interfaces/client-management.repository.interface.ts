import type { UserStatus } from '@prisma/client';

export const CLIENT_MGMT_REPOSITORY = Symbol('CLIENT_MGMT_REPOSITORY');

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
}

export interface IClientManagementRepository {
  listClients(filters: ListClientsFilters): Promise<ClientSafe[]>;
  findClientById(id: number): Promise<ClientSafe | null>;
  approveClientById(id: number): Promise<void>;
  rejectClientById(id: number): Promise<void>;
}
