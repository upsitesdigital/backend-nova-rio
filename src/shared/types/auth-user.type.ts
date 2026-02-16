export interface AuthUser {
  id: number;
  email: string;
  type: 'client' | 'admin';
  role?: string;
}
