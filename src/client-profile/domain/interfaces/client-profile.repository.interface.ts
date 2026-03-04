import type { ClientProfile } from '../../../auth/domain/interfaces/client.repository.interface.js';

export const PROFILE_REPOSITORY = Symbol('PROFILE_REPOSITORY');

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  company?: string;
  cpfCnpj?: string;
  address?: string;
}

export interface IClientProfileRepository {
  updateProfile(id: number, data: UpdateProfileData): Promise<ClientProfile>;
}
