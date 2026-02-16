import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ADMIN_REPOSITORY } from '../../../domain/interfaces/admin.repository.interface.js';
import { CLIENT_REPOSITORY } from '../../../domain/interfaces/client.repository.interface.js';
import { HASH_SERVICE } from '../../../domain/interfaces/hash.service.interface.js';
import { TOKEN_SERVICE } from '../../../domain/interfaces/token.service.interface.js';
import { RefreshTokenUseCase } from './refresh-token.use-case.js';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let tokenService: { verifyRefreshToken: jest.Mock; generateTokens: jest.Mock };
  let hashService: { compare: jest.Mock; hash: jest.Mock };
  let clientRepository: { getRefreshToken: jest.Mock; updateRefreshToken: jest.Mock };
  let adminRepository: { getRefreshToken: jest.Mock; updateRefreshToken: jest.Mock };

  beforeEach(async () => {
    tokenService = {
      verifyRefreshToken: jest.fn(),
      generateTokens: jest.fn(),
    };
    hashService = {
      compare: jest.fn(),
      hash: jest.fn(),
    };
    clientRepository = {
      getRefreshToken: jest.fn(),
      updateRefreshToken: jest.fn(),
    };
    adminRepository = {
      getRefreshToken: jest.fn(),
      updateRefreshToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        { provide: TOKEN_SERVICE, useValue: tokenService },
        { provide: HASH_SERVICE, useValue: hashService },
        { provide: CLIENT_REPOSITORY, useValue: clientRepository },
        { provide: ADMIN_REPOSITORY, useValue: adminRepository },
      ],
    }).compile();

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw UnauthorizedException if refresh token is revoked', async () => {
    tokenService.verifyRefreshToken.mockResolvedValue({ sub: 1, type: 'client' });
    clientRepository.getRefreshToken.mockResolvedValue(null);

    await expect(useCase.execute({ refreshToken: 'token' })).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if refresh token hash does not match', async () => {
    tokenService.verifyRefreshToken.mockResolvedValue({ sub: 1, type: 'client' });
    clientRepository.getRefreshToken.mockResolvedValue('hashed_token');
    hashService.compare.mockResolvedValue(false);

    await expect(useCase.execute({ refreshToken: 'token' })).rejects.toThrow(UnauthorizedException);
  });

  it('should return new tokens and update hash for client', async () => {
    const payload = { sub: 1, type: 'client', email: 'test@test.com' };
    const tokens = { accessToken: 'new_access', refreshToken: 'new_refresh' };

    tokenService.verifyRefreshToken.mockResolvedValue(payload);
    clientRepository.getRefreshToken.mockResolvedValue('old_hashed');
    hashService.compare.mockResolvedValue(true);
    tokenService.generateTokens.mockResolvedValue(tokens);
    hashService.hash.mockResolvedValue('new_hashed');

    const result = await useCase.execute({ refreshToken: 'old_refresh' });

    expect(result).toEqual(tokens);
    expect(tokenService.generateTokens).toHaveBeenCalledWith(payload);
    expect(clientRepository.updateRefreshToken).toHaveBeenCalledWith(1, 'new_hashed');
  });

  it('should return new tokens and update hash for admin', async () => {
    const payload = { sub: 1, type: 'admin', email: 'admin@test.com' };
    const tokens = { accessToken: 'new_access', refreshToken: 'new_refresh' };

    tokenService.verifyRefreshToken.mockResolvedValue(payload);
    adminRepository.getRefreshToken.mockResolvedValue('old_hashed');
    hashService.compare.mockResolvedValue(true);
    tokenService.generateTokens.mockResolvedValue(tokens);
    hashService.hash.mockResolvedValue('new_hashed');

    const result = await useCase.execute({ refreshToken: 'old_refresh' });

    expect(result).toEqual(tokens);
    expect(tokenService.generateTokens).toHaveBeenCalledWith(payload);
    expect(adminRepository.updateRefreshToken).toHaveBeenCalledWith(1, 'new_hashed');
  });
});
