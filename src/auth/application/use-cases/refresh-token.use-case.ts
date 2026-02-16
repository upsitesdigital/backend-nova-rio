import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ADMIN_REPOSITORY } from '../../domain/interfaces/admin.repository.interface.js';
import type { IAdminRepository } from '../../domain/interfaces/admin.repository.interface.js';
import { CLIENT_REPOSITORY } from '../../domain/interfaces/client.repository.interface.js';
import type { IClientRepository } from '../../domain/interfaces/client.repository.interface.js';
import { HASH_SERVICE } from '../../domain/interfaces/hash.service.interface.js';
import type { IHashService } from '../../domain/interfaces/hash.service.interface.js';
import { TOKEN_SERVICE } from '../../domain/interfaces/token.service.interface.js';
import type { ITokenService, TokenPair } from '../../domain/interfaces/token.service.interface.js';
import { RefreshTokenDto } from '../../dto/refresh-token.dto.js';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(TOKEN_SERVICE) private tokenService: ITokenService,
    @Inject(HASH_SERVICE) private hashService: IHashService,
    @Inject(CLIENT_REPOSITORY) private clientRepository: IClientRepository,
    @Inject(ADMIN_REPOSITORY) private adminRepository: IAdminRepository,
  ) {}

  async execute(dto: RefreshTokenDto): Promise<TokenPair> {
    const payload = await this.tokenService.verifyRefreshToken(dto.refreshToken);

    const storedHash =
      payload.type === 'client'
        ? await this.clientRepository.getRefreshToken(payload.sub)
        : await this.adminRepository.getRefreshToken(payload.sub);

    if (!storedHash) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    const tokenValid = await this.hashService.compare(dto.refreshToken, storedHash);

    if (!tokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.tokenService.generateTokens(payload);

    const hashedRefresh = await this.hashService.hash(tokens.refreshToken);

    if (payload.type === 'client') {
      await this.clientRepository.updateRefreshToken(payload.sub, hashedRefresh);
    } else {
      await this.adminRepository.updateRefreshToken(payload.sub, hashedRefresh);
    }

    return tokens;
  }
}
