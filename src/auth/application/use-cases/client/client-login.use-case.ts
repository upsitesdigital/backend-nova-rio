import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CLIENT_REPOSITORY } from '../../../domain/interfaces/client.repository.interface.js';
import type { IClientRepository } from '../../../domain/interfaces/client.repository.interface.js';
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
    @Inject(CLIENT_REPOSITORY) private clientRepository: IClientRepository,
    @Inject(HASH_SERVICE) private hashService: IHashService,
    @Inject(TOKEN_SERVICE) private tokenService: ITokenService,
  ) {}

  async execute(dto: ClientLoginDto): Promise<TokenPair> {
    const client = await this.clientRepository.findByEmail(dto.email);

    if (!client) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await this.hashService.compare(dto.password, client.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.tokenService.generateTokens({
      sub: client.id,
      email: client.email,
      type: 'client',
    });

    const hashedRefresh = await this.hashService.hash(tokens.refreshToken);
    await this.clientRepository.updateRefreshToken(client.id, hashedRefresh);

    return tokens;
  }
}
