import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { CLIENT_REPOSITORY } from '../../../domain/interfaces/client.repository.interface.js';
import type { IClientRepository } from '../../../domain/interfaces/client.repository.interface.js';
import { HASH_SERVICE } from '../../../domain/interfaces/hash.service.interface.js';
import type { IHashService } from '../../../domain/interfaces/hash.service.interface.js';
import { TOKEN_SERVICE } from '../../../domain/interfaces/token.service.interface.js';
import type {
  ITokenService,
  TokenPair,
} from '../../../domain/interfaces/token.service.interface.js';
import { ClientRegisterDto } from '../../../dto/client-register.dto.js';

@Injectable()
export class ClientRegisterUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY) private clientRepository: IClientRepository,
    @Inject(HASH_SERVICE) private hashService: IHashService,
    @Inject(TOKEN_SERVICE) private tokenService: ITokenService,
  ) {}

  async execute(dto: ClientRegisterDto): Promise<TokenPair> {
    const existing = await this.clientRepository.findByEmail(dto.email);

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await this.hashService.hash(dto.password);

    const client = await this.clientRepository.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      password: hashedPassword,
    });

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
