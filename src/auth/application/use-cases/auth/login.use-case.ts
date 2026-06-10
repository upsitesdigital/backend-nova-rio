import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { randomUUID } from 'node:crypto';
import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import type { IClientAuthRepository } from '../../../domain/interfaces/client.repository.interface.js';
import type { IAdminAuthRepository } from '../../../domain/interfaces/admin.repository.interface.js';
import type { IHashService } from '../../../domain/interfaces/hash.service.interface.js';
import type {
  ITokenService,
  TokenPair,
  TokenPayload,
} from '../../../domain/interfaces/token.service.interface.js';
import { UserStatus } from '@prisma/client';
import type { AdminRole } from '@prisma/client';
import type { LoginDto } from '../../../dto/login.dto.js';

export interface LoginResult extends TokenPair {
  userType: 'client' | 'admin';
}

interface AuthenticableUser {
  id: number;
  email: string;
  password: string;
  status: UserStatus;
  lockedUntil: Date | null;
  failedLoginAttempts: number;
  role?: AdminRole;
}

interface AuthRepository {
  findByEmail(email: string): Promise<AuthenticableUser | null>;
  reserveLoginAttempt(id: number): Promise<boolean>;
  incrementFailedLoginAttempts(id: number): Promise<void>;
  resetFailedLoginAttempts(id: number): Promise<void>;
  updateRefreshTokenWithFamily(id: number, hash: string, family: string): Promise<boolean>;
}

const INVALID_CREDENTIALS = 'Invalid credentials';
const DUMMY_HASH = '$2b$10$D74tBEymfGwQWP.6q2k1De3e63SxMMh0XiOpUp1.n0/obZbkHMMqK';

@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    @Inject(DiTokens.clientAuthRepository) private readonly clientRepository: IClientAuthRepository,
    @Inject(DiTokens.adminAuthRepository) private readonly adminRepository: IAdminAuthRepository,
    @Inject(DiTokens.hashService) private readonly hashService: IHashService,
    @Inject(DiTokens.tokenService) private readonly tokenService: ITokenService,
  ) {}

  async authenticateUser(dto: LoginDto): Promise<LoginResult> {
    const email = dto.email.toLowerCase().trim();

    const [client, admin] = await Promise.all([
      this.clientRepository.findByEmail(email),
      this.adminRepository.findByEmail(email),
    ]);

    // Client takes precedence. If a client account exists but is locked/inactive,
    // authentication fails immediately — it does NOT fall through to admin lookup.
    // This prevents bypassing account restrictions via a secondary user type.
    const clientResult = await this.tryAuthenticate(
      client,
      dto.password,
      this.clientRepository,
      'client',
    );
    if (clientResult) return clientResult;

    const adminResult = await this.tryAuthenticate(
      admin,
      dto.password,
      this.adminRepository,
      'admin',
    );
    if (adminResult) return adminResult;

    await this.hashService.compare(dto.password, DUMMY_HASH);

    throw new UnauthorizedException(INVALID_CREDENTIALS);
  }

  private async tryAuthenticate(
    user: AuthenticableUser | null,
    password: string,
    repository: AuthRepository,
    userType: 'client' | 'admin',
  ): Promise<LoginResult | null> {
    if (!user) return null;

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      this.logger.warn(`Locked account login attempt: ${userType}#${user.id}`);
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    if (user.status !== UserStatus.ACTIVE) {
      this.logger.warn(`Non-active ${userType}#${user.id} login attempt (status: ${user.status})`);
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    const attemptReserved = await repository.reserveLoginAttempt(user.id);
    if (!attemptReserved) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    const valid = await this.hashService.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    await repository.resetFailedLoginAttempts(user.id);

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      type: userType,
      ...(userType === 'admin' && user.role ? { role: user.role } : {}),
    };

    const tokens = await this.tokenService.generateTokens(payload);

    const hashedRefresh = await this.hashService.hash(tokens.refreshToken);
    const family = randomUUID();
    await repository.updateRefreshTokenWithFamily(user.id, hashedRefresh, family);

    return { ...tokens, userType };
  }
}
