import { randomUUID } from 'node:crypto';
import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ADMIN_AUTH_REPOSITORY } from '../../../domain/interfaces/admin.repository.interface.js';
import type { IAdminAuthRepository } from '../../../domain/interfaces/admin.repository.interface.js';
import { HASH_SERVICE } from '../../../domain/interfaces/hash.service.interface.js';
import type { IHashService } from '../../../domain/interfaces/hash.service.interface.js';
import { TOKEN_SERVICE } from '../../../domain/interfaces/token.service.interface.js';
import type {
  ITokenService,
  TokenPair,
} from '../../../domain/interfaces/token.service.interface.js';
import { AdminLoginDto } from '../../../dto/admin-login.dto.js';

@Injectable()
export class AdminLoginUseCase {
  constructor(
    @Inject(ADMIN_AUTH_REPOSITORY) private adminRepository: IAdminAuthRepository,
    @Inject(HASH_SERVICE) private hashService: IHashService,
    @Inject(TOKEN_SERVICE) private tokenService: ITokenService,
  ) {}

  async loginAdmin(dto: AdminLoginDto): Promise<TokenPair> {
    const admin = await this.adminRepository.findByEmail(dto.email);

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      throw new ForbiddenException('Account is temporarily locked. Try again later');
    }

    if (admin.status !== 'ACTIVE') {
      throw new ForbiddenException('Account is not active');
    }

    const passwordValid = await this.hashService.compare(dto.password, admin.password);

    if (!passwordValid) {
      await this.adminRepository.incrementFailedLoginAttempts(admin.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.adminRepository.resetFailedLoginAttempts(admin.id);

    const tokens = await this.tokenService.generateTokens({
      sub: admin.id,
      email: admin.email,
      type: 'admin',
      role: admin.role,
    });

    const hashedRefresh = await this.hashService.hash(tokens.refreshToken);
    const family = randomUUID();
    await this.adminRepository.updateRefreshTokenWithFamily(admin.id, hashedRefresh, family);

    return tokens;
  }
}
