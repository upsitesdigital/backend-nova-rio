import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable } from '@nestjs/common';
import type { AuthUser } from '../../../../shared/types/auth-user.type.js';
import { type IAdminAuthRepository } from '../../../domain/interfaces/admin.repository.interface.js';
import { type IClientAuthRepository } from '../../../domain/interfaces/client.repository.interface.js';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(DiTokens.clientAuthRepository) private clientAuthRepository: IClientAuthRepository,
    @Inject(DiTokens.adminAuthRepository) private adminAuthRepository: IAdminAuthRepository,
  ) {}

  async logout(user: AuthUser): Promise<{ message: string }> {
    const repo = user.type === 'client' ? this.clientAuthRepository : this.adminAuthRepository;

    await repo.revokeTokenFamily(user.id);

    return { message: 'Logged out successfully' };
  }
}
