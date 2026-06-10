import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { type Mock, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenUseCase } from './refresh-token.use-case.js';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let tokenService: { verifyRefreshToken: Mock; generateTokens: Mock };
  let hashService: { compare: Mock; hash: Mock };
  let clientRepository: {
    getRefreshTokenAndFamily: Mock;
    updateRefreshTokenWithFamily: Mock;
    revokeTokenFamily: Mock;
  };
  let adminRepository: {
    getRefreshTokenAndFamily: Mock;
    updateRefreshTokenWithFamily: Mock;
    revokeTokenFamily: Mock;
  };

  beforeEach(async () => {
    tokenService = {
      verifyRefreshToken: vi.fn(),
      generateTokens: vi.fn(),
    };
    hashService = {
      compare: vi.fn(),
      hash: vi.fn(),
    };
    clientRepository = {
      getRefreshTokenAndFamily: vi.fn(),
      updateRefreshTokenWithFamily: vi.fn(),
      revokeTokenFamily: vi.fn(),
    };
    adminRepository = {
      getRefreshTokenAndFamily: vi.fn(),
      updateRefreshTokenWithFamily: vi.fn(),
      revokeTokenFamily: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        { provide: DiTokens.tokenService, useValue: tokenService },
        { provide: DiTokens.hashService, useValue: hashService },
        { provide: DiTokens.clientAuthRepository, useValue: clientRepository },
        { provide: DiTokens.adminAuthRepository, useValue: adminRepository },
      ],
    }).compile();

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw UnauthorizedException if refresh token is revoked', async () => {
    tokenService.verifyRefreshToken.mockResolvedValue({ sub: 1, type: 'client' });
    clientRepository.getRefreshTokenAndFamily.mockResolvedValue({
      refreshToken: null,
      tokenFamily: null,
    });

    await expect(useCase.refreshTokens({ refreshToken: 'token' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should revoke token family and throw if hash does not match', async () => {
    tokenService.verifyRefreshToken.mockResolvedValue({ sub: 1, type: 'client' });
    clientRepository.getRefreshTokenAndFamily.mockResolvedValue({
      refreshToken: 'hashed_token',
      tokenFamily: 'family-uuid',
    });
    hashService.compare.mockResolvedValue(false);

    await expect(useCase.refreshTokens({ refreshToken: 'token' })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(clientRepository.revokeTokenFamily).toHaveBeenCalledWith(1);
  });

  it('should return new tokens and update with same family for client', async () => {
    const payload = { sub: 1, type: 'client', email: 'test@test.com' };
    const tokens = { accessToken: 'new_access', refreshToken: 'new_refresh' };

    tokenService.verifyRefreshToken.mockResolvedValue(payload);
    clientRepository.getRefreshTokenAndFamily.mockResolvedValue({
      refreshToken: 'old_hashed',
      tokenFamily: 'family-uuid',
    });
    hashService.compare.mockResolvedValue(true);
    tokenService.generateTokens.mockResolvedValue(tokens);
    hashService.hash.mockResolvedValue('new_hashed');

    const result = await useCase.refreshTokens({ refreshToken: 'old_refresh' });

    expect(result).toEqual(tokens);
    expect(clientRepository.updateRefreshTokenWithFamily).toHaveBeenCalledWith(
      1,
      'new_hashed',
      'family-uuid',
      'old_hashed',
    );
  });

  it('should return new tokens and update with same family for admin', async () => {
    const payload = { sub: 1, type: 'admin', email: 'admin@test.com' };
    const tokens = { accessToken: 'new_access', refreshToken: 'new_refresh' };

    tokenService.verifyRefreshToken.mockResolvedValue(payload);
    adminRepository.getRefreshTokenAndFamily.mockResolvedValue({
      refreshToken: 'old_hashed',
      tokenFamily: 'family-uuid',
    });
    hashService.compare.mockResolvedValue(true);
    tokenService.generateTokens.mockResolvedValue(tokens);
    hashService.hash.mockResolvedValue('new_hashed');

    const result = await useCase.refreshTokens({ refreshToken: 'old_refresh' });

    expect(result).toEqual(tokens);
    expect(adminRepository.updateRefreshTokenWithFamily).toHaveBeenCalledWith(
      1,
      'new_hashed',
      'family-uuid',
      'old_hashed',
    );
  });
});
