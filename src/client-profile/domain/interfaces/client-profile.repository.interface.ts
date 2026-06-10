import type { ClientProfile } from '../../../auth/domain/interfaces/client.repository.interface.js';

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  company?: string;
  cpfCnpj?: string;
  address?: string;
}

export interface IClientProfileRepository {
  findClientProfileById(id: number): Promise<ClientProfile | null>;
  updateProfile(id: number, data: UpdateProfileData): Promise<ClientProfile>;
}
