import { randomUUID } from 'node:crypto';
import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CLIENT_AUTH_REPOSITORY } from '../../../domain/interfaces/client.repository.interface.js';
import type { IClientAuthRepository } from '../../../domain/interfaces/client.repository.interface.js';
import { HASH_SERVICE } from '../../../domain/interfaces/hash.service.interface.js';
import type { IHashService } from '../../../domain/interfaces/hash.service.interface.js';
import { TOKEN_SERVICE } from '../../../domain/interfaces/token.service.interface.js';
import type {
  ITokenService,
  TokenPair,
} from '../../../domain/interfaces/token.service.interface.js';
import { ClientLoginDto } from '../../../dto/client-login.dto.js';

@Injectable()
export class ClientLoginUseCase {
  constructor(
    @Inject(CLIENT_AUTH_REPOSITORY) private clientRepository: IClientAuthRepository,
    @Inject(HASH_SERVICE) private hashService: IHashService,
    @Inject(TOKEN_SERVICE) private tokenService: ITokenService,
  ) {}

  async loginClient(dto: ClientLoginDto): Promise<TokenPair> {
    const client = await this.clientRepository.findByEmail(dto.email);

    if (!client) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (client.lockedUntil && client.lockedUntil > new Date()) {
      throw new ForbiddenException('Account is temporarily locked. Try again later');
    }

    if (client.status === 'PENDING') {
      throw new ForbiddenException(
        'Your account is pending approval. Please wait for activation before logging in.',
      );
    }

    if (client.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await this.hashService.compare(dto.password, client.password);

    if (!passwordValid) {
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

    return tokens;
  }
}
