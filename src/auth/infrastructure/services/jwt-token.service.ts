import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ITokenService,
  TokenPair,
  TokenPayload,
} from '../../domain/interfaces/token.service.interface.js';

@Injectable()
export class JwtTokenService implements ITokenService {
  private readonly secret: string;
  private readonly refreshSecret: string;

  constructor(
    private jwtService: JwtService,
    configService: ConfigService,
  ) {
    this.secret = configService.getOrThrow<string>('JWT_SECRET');
    this.refreshSecret = configService.getOrThrow<string>('JWT_REFRESH_SECRET');
  }

  async generateTokens(payload: TokenPayload): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.secret,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.refreshSecret,
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    try {
      return await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
