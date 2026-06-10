import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { type IAdminAuthRepository } from '../../../domain/interfaces/admin.repository.interface.js';
import { type IClientAuthRepository } from '../../../domain/interfaces/client.repository.interface.js';
import type { IHashService } from '../../../domain/interfaces/hash.service.interface.js';
import type {
  ITokenService,
  TokenPair,
} from '../../../domain/interfaces/token.service.interface.js';
import { RefreshTokenDto } from '../../../dto/refresh-token.dto.js';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(DiTokens.tokenService) private tokenService: ITokenService,
    @Inject(DiTokens.hashService) private hashService: IHashService,
    @Inject(DiTokens.clientAuthRepository) private clientAuthRepository: IClientAuthRepository,
    @Inject(DiTokens.adminAuthRepository) private adminAuthRepository: IAdminAuthRepository,
  ) {}

  async refreshTokens(dto: RefreshTokenDto): Promise<TokenPair> {
    const verified = await this.tokenService.verifyRefreshToken(dto.refreshToken);
    const payload = {
      sub: verified.sub,
      email: verified.email,
      type: verified.type,
      ...(verified.role ? { role: verified.role } : {}),
    };

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
    const rotated = await repo.updateRefreshTokenWithFamily(
      payload.sub,
      hashedRefresh,
      tokenFamily,
      storedHash,
    );

    if (rotated === false) {
      await repo.revokeTokenFamily(payload.sub);
      throw new UnauthorizedException('Invalid refresh token');
    }

    return tokens;
  }
}
