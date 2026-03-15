import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  ADMIN_AUTH_REPOSITORY,
  type IAdminAuthRepository,
} from '../../../domain/interfaces/admin.repository.interface.js';
import {
  CLIENT_AUTH_REPOSITORY,
  type IClientAuthRepository,
} from '../../../domain/interfaces/client.repository.interface.js';
import { HASH_SERVICE } from '../../../domain/interfaces/hash.service.interface.js';
import type { IHashService } from '../../../domain/interfaces/hash.service.interface.js';
import { TOKEN_SERVICE } from '../../../domain/interfaces/token.service.interface.js';
import type {
  ITokenService,
  TokenPair,
} from '../../../domain/interfaces/token.service.interface.js';
import { RefreshTokenDto } from '../../../dto/refresh-token.dto.js';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(TOKEN_SERVICE) private tokenService: ITokenService,
    @Inject(HASH_SERVICE) private hashService: IHashService,
    @Inject(CLIENT_AUTH_REPOSITORY) private clientAuthRepository: IClientAuthRepository,
    @Inject(ADMIN_AUTH_REPOSITORY) private adminAuthRepository: IAdminAuthRepository,
  ) {}

  async refreshTokens(dto: RefreshTokenDto): Promise<TokenPair> {
    const payload = await this.tokenService.verifyRefreshToken(dto.refreshToken);

    const repo = payload.type === 'client' ? this.clientAuthRepository : this.adminAuthRepository;

    const { refreshToken: storedHash, tokenFamily } = await repo.getRefreshTokenAndFamily(
      payload.sub,
    );

    if (!storedHash || !tokenFamily) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    const tokenValid = await this.hashService.compare(dto.refreshToken, storedHash);

    if (!tokenValid) {
      await repo.revokeTokenFamily(payload.sub);
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.tokenService.generateTokens(payload);

    const hashedRefresh = await this.hashService.hash(tokens.refreshToken);
    await repo.updateRefreshTokenWithFamily(payload.sub, hashedRefresh, tokenFamily);

    return tokens;
  }
}
