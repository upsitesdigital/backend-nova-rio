import { randomUUID } from 'node:crypto';
import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CLIENT_AUTH_REPOSITORY } from '../../../domain/interfaces/client.repository.interface.js';
import type { IClientAuthRepository } from '../../../domain/interfaces/client.repository.interface.js';
import { ADMIN_AUTH_REPOSITORY } from '../../../domain/interfaces/admin.repository.interface.js';
import type { IAdminAuthRepository } from '../../../domain/interfaces/admin.repository.interface.js';
import { HASH_SERVICE } from '../../../domain/interfaces/hash.service.interface.js';
import type { IHashService } from '../../../domain/interfaces/hash.service.interface.js';
import { TOKEN_SERVICE } from '../../../domain/interfaces/token.service.interface.js';
import type { ITokenService } from '../../../domain/interfaces/token.service.interface.js';
import type { LoginDto } from '../../../dto/login.dto.js';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  userType: 'client' | 'admin';
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(CLIENT_AUTH_REPOSITORY) private clientRepository: IClientAuthRepository,
    @Inject(ADMIN_AUTH_REPOSITORY) private adminRepository: IAdminAuthRepository,
    @Inject(HASH_SERVICE) private hashService: IHashService,
    @Inject(TOKEN_SERVICE) private tokenService: ITokenService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResult> {
    const clientResult = await this.tryClientLogin(dto);
    if (clientResult) return clientResult;

    const adminResult = await this.tryAdminLogin(dto);
    if (adminResult) return adminResult;

    throw new UnauthorizedException('Invalid credentials');
  }

  private async tryClientLogin(dto: LoginDto): Promise<LoginResult | null> {
    const client = await this.clientRepository.findByEmail(dto.email);
    if (!client) return null;

    if (client.lockedUntil && client.lockedUntil > new Date()) {
      throw new ForbiddenException('Account is temporarily locked. Try again later');
    }

    if (client.status === 'PENDING') {
      throw new ForbiddenException(
        'Your account is pending approval. Please wait for activation before logging in.',
      );
    }

    if (client.status !== 'ACTIVE') return null;

    const valid = await this.hashService.compare(dto.password, client.password);
    if (!valid) {
      await this.clientRepository.incrementFailedLoginAttempts(client.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.clientRepository.resetFailedLoginAttempts(client.id);

    const tokens = await this.tokenService.generateTokens({
      sub: client.id,
      email: client.email,
      type: 'client',
    });

    const hashedRefresh = await this.hashService.hash(tokens.refreshToken);
    const family = randomUUID();
    await this.clientRepository.updateRefreshTokenWithFamily(client.id, hashedRefresh, family);

    return { ...tokens, userType: 'client' };
  }

  private async tryAdminLogin(dto: LoginDto): Promise<LoginResult | null> {
    const admin = await this.adminRepository.findByEmail(dto.email);
    if (!admin) return null;

    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      throw new ForbiddenException('Account is temporarily locked. Try again later');
    }

    if (admin.status !== 'ACTIVE') {
      throw new ForbiddenException('Account is not active');
    }

    const valid = await this.hashService.compare(dto.password, admin.password);
    if (!valid) {
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

    return { ...tokens, userType: 'admin' };
  }
}
