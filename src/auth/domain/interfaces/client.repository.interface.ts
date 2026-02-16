export const CLIENT_REPOSITORY = Symbol('CLIENT_REPOSITORY');

export interface ClientData {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  password: string;
  avatarUrl: string | null;
  company: string | null;
  cpfCnpj: string | null;
  address: string | null;
  status: string;
  refreshToken: string | null;
  createdAt: Date;
}

export interface CreateClientData {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface ClientProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  company: string | null;
  cpfCnpj: string | null;
  address: string | null;
  status: string;
  createdAt: Date;
}

export interface IClientRepository {
  findByEmail(email: string): Promise<ClientData | null>;
  findById(id: number): Promise<ClientData | null>;
  findProfileById(id: number): Promise<ClientProfile | null>;
  create(data: CreateClientData): Promise<ClientData>;
  updateRefreshToken(id: number, refreshToken: string | null): Promise<void>;
  getRefreshToken(id: number): Promise<string | null>;
  createVerificationCode(
    clientId: number,
    code: string,
    type: string,
    channel: string,
    expiresAt: Date,
  ): Promise<void>;
}
