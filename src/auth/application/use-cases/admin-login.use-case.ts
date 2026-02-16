import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ADMIN_REPOSITORY } from '../../domain/interfaces/admin.repository.interface.js';
import type { IAdminRepository } from '../../domain/interfaces/admin.repository.interface.js';
import { HASH_SERVICE } from '../../domain/interfaces/hash.service.interface.js';
import type { IHashService } from '../../domain/interfaces/hash.service.interface.js';
import { TOKEN_SERVICE } from '../../domain/interfaces/token.service.interface.js';
import type { ITokenService, TokenPair } from '../../domain/interfaces/token.service.interface.js';
import { AdminLoginDto } from '../../dto/admin-login.dto.js';

@Injectable()
export class AdminLoginUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY) private adminRepository: IAdminRepository,
    @Inject(HASH_SERVICE) private hashService: IHashService,
    @Inject(TOKEN_SERVICE) private tokenService: ITokenService,
  ) {}

  async execute(dto: AdminLoginDto): Promise<TokenPair> {
    const admin = await this.adminRepository.findByEmail(dto.email);

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (admin.status !== 'ACTIVE') {
      throw new ForbiddenException('Account is not active');
    }

    const passwordValid = await this.hashService.compare(dto.password, admin.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.tokenService.generateTokens({
      sub: admin.id,
      email: admin.email,
      type: 'admin',
      role: admin.role,
    });

    const hashedRefresh = await this.hashService.hash(tokens.refreshToken);
    await this.adminRepository.updateRefreshToken(admin.id, hashedRefresh);

    return tokens;
  }
}
