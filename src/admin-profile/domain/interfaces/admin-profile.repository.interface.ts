import type {
  AdminData,
  AdminProfile,
} from '../../../auth/domain/interfaces/admin.repository.interface.js';

export interface UpdateAdminProfileData {
  name?: string;
}

export interface AdminVerificationCodeRecord {
  id: number;
  code: string;
  expiresAt: Date;
}

export interface IAdminProfileSelfRepository {
  findAdminById(id: number): Promise<AdminData | null>;
  findByEmail(email: string): Promise<AdminData | null>;
  findAdminProfileById(id: number): Promise<AdminProfile | null>;
  updateProfile(id: number, data: UpdateAdminProfileData): Promise<AdminProfile>;
  updateEmail(id: number, email: string): Promise<void>;
  updatePassword(id: number, password: string): Promise<void>;
  createVerificationCode(
    adminId: number,
    code: string,
    type: string,
    channel: string,
    expiresAt: Date,
  ): Promise<void>;
  deleteVerificationCodesByAdminId(adminId: number, type: string): Promise<void>;
  findActiveVerificationCodes(
    adminId: number,
    type: string,
  ): Promise<AdminVerificationCodeRecord[]>;
  markVerificationCodeAsUsed(id: number): Promise<boolean>;
}
