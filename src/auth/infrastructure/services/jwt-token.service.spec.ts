import { type Mock, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import type { TokenPayload } from '../../domain/interfaces/token.service.interface.js';
import { JwtTokenService } from './jwt-token.service.js';

describe('JwtTokenService', () => {
  let service: JwtTokenService;
  let jwtService: { signAsync: Mock; verifyAsync: Mock };
  let configService: { getOrThrow: Mock };

  beforeEach(async () => {
    jwtService = {
      signAsync: vi.fn(),
      verifyAsync: vi.fn(),
    };
    configService = {
      getOrThrow: vi.fn().mockReturnValueOnce('secret').mockReturnValueOnce('refresh-secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtTokenService,
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<JwtTokenService>(JwtTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('generateTokens should call jwtService.signAsync twice', async () => {
    jwtService.signAsync.mockResolvedValueOnce('access').mockResolvedValueOnce('refresh');
    const payload: TokenPayload = { sub: 1, email: 'test@test.com', type: 'client' };

    const result = await service.generateTokens(payload);

    expect(result).toEqual({ accessToken: 'access', refreshToken: 'refresh' });
    expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
  });

  it('verifyRefreshToken should return payload if valid', async () => {
    const payload: TokenPayload = { sub: 1, email: 'test@test.com', type: 'client' };
    jwtService.verifyAsync.mockResolvedValue(payload);

    const result = await service.verifyRefreshToken('token');

    expect(result).toBe(payload);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('token', { secret: 'refresh-secret' });
  });

  it('verifyRefreshToken should throw UnauthorizedException if invalid', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error());

    await expect(service.verifyRefreshToken('token')).rejects.toThrow(UnauthorizedException);
  });
});
