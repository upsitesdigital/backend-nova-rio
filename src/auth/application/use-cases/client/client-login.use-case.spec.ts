import { type Mock, vi } from 'vitest';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CLIENT_REPOSITORY } from '../../../domain/interfaces/client.repository.interface.js';
import { HASH_SERVICE } from '../../../domain/interfaces/hash.service.interface.js';
import { TOKEN_SERVICE } from '../../../domain/interfaces/token.service.interface.js';
import { ClientLoginUseCase } from './client-login.use-case.js';

describe('ClientLoginUseCase', () => {
  let useCase: ClientLoginUseCase;
  let clientRepository: {
    findByEmail: Mock;
    updateRefreshToken: Mock;
    incrementFailedLoginAttempts: Mock;
    resetFailedLoginAttempts: Mock;
    updateRefreshTokenWithFamily: Mock;
  };
  let hashService: { compare: Mock; hash: Mock };
  let tokenService: { generateTokens: Mock };

  beforeEach(async () => {
    clientRepository = {
      findByEmail: vi.fn(),
      updateRefreshToken: vi.fn(),
      incrementFailedLoginAttempts: vi.fn(),
      resetFailedLoginAttempts: vi.fn(),
      updateRefreshTokenWithFamily: vi.fn(),
    };
    hashService = {
      compare: vi.fn(),
      hash: vi.fn(),
    };
    tokenService = {
      generateTokens: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientLoginUseCase,
        { provide: CLIENT_REPOSITORY, useValue: clientRepository },
        { provide: HASH_SERVICE, useValue: hashService },
        { provide: TOKEN_SERVICE, useValue: tokenService },
      ],
    }).compile();

    useCase = module.get<ClientLoginUseCase>(ClientLoginUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw UnauthorizedException if client not found', async () => {
    clientRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.loginClient({ email: 'test@example.com', password: 'password' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw ForbiddenException if account is locked', async () => {
    clientRepository.findByEmail.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      status: 'ACTIVE',
      lockedUntil: new Date(Date.now() + 60_000),
      failedLoginAttempts: 5,
    });

    await expect(
      useCase.loginClient({ email: 'test@example.com', password: 'password' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw UnauthorizedException and increment failed attempts if password is invalid', async () => {
    clientRepository.findByEmail.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      status: 'ACTIVE',
      lockedUntil: null,
      failedLoginAttempts: 0,
    });
    hashService.compare.mockResolvedValue(false);

    await expect(
      useCase.loginClient({ email: 'test@example.com', password: 'password' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(clientRepository.incrementFailedLoginAttempts).toHaveBeenCalledWith(1);
  });

  it('should throw ForbiddenException if client status is PENDING', async () => {
    clientRepository.findByEmail.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      status: 'PENDING',
      lockedUntil: null,
      failedLoginAttempts: 0,
    });
    hashService.compare.mockResolvedValue(true);

    await expect(
      useCase.loginClient({ email: 'test@example.com', password: 'password' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if client status is INACTIVE', async () => {
    clientRepository.findByEmail.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      status: 'INACTIVE',
      lockedUntil: null,
      failedLoginAttempts: 0,
    });
    hashService.compare.mockResolvedValue(true);

    await expect(
      useCase.loginClient({ email: 'test@example.com', password: 'password' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should return tokens, reset failed attempts, and store token family on success', async () => {
    const client = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      status: 'ACTIVE',
      lockedUntil: null,
      failedLoginAttempts: 2,
    };
    const tokens = {
      accessToken: 'access',
      refreshToken: 'refresh',
    };

    clientRepository.findByEmail.mockResolvedValue(client);
    hashService.compare.mockResolvedValue(true);
    tokenService.generateTokens.mockResolvedValue(tokens);
    hashService.hash.mockResolvedValue('hashedRefresh');

    const result = await useCase.loginClient({
      email: 'test@example.com',
      password: 'password',
    });

    expect(result).toEqual(tokens);
    expect(clientRepository.resetFailedLoginAttempts).toHaveBeenCalledWith(client.id);
    expect(tokenService.generateTokens).toHaveBeenCalledWith({
      sub: client.id,
      email: client.email,
      type: 'client',
    });
    expect(hashService.hash).toHaveBeenCalledWith(tokens.refreshToken);
    expect(clientRepository.updateRefreshTokenWithFamily).toHaveBeenCalledWith(
      client.id,
      'hashedRefresh',
      expect.any(String),
    );
  });
});
