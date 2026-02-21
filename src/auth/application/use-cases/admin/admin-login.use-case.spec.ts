import { type Mock, vi } from 'vitest';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ADMIN_REPOSITORY } from '../../../domain/interfaces/admin.repository.interface.js';
import { HASH_SERVICE } from '../../../domain/interfaces/hash.service.interface.js';
import { TOKEN_SERVICE } from '../../../domain/interfaces/token.service.interface.js';
import { AdminLoginUseCase } from './admin-login.use-case.js';

describe('AdminLoginUseCase', () => {
  let useCase: AdminLoginUseCase;
  let adminRepository: {
    findByEmail: Mock;
    updateRefreshToken: Mock;
    incrementFailedLoginAttempts: Mock;
    resetFailedLoginAttempts: Mock;
    updateRefreshTokenWithFamily: Mock;
  };
  let hashService: { compare: Mock; hash: Mock };
  let tokenService: { generateTokens: Mock };

  beforeEach(async () => {
    adminRepository = {
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
        AdminLoginUseCase,
        { provide: ADMIN_REPOSITORY, useValue: adminRepository },
        { provide: HASH_SERVICE, useValue: hashService },
        { provide: TOKEN_SERVICE, useValue: tokenService },
      ],
    }).compile();

    useCase = module.get<AdminLoginUseCase>(AdminLoginUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw UnauthorizedException if admin not found', async () => {
    adminRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.loginAdmin({ email: 'test@example.com', password: 'password' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw ForbiddenException if admin is not active', async () => {
    adminRepository.findByEmail.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      status: 'INACTIVE',
      lockedUntil: null,
    });

    await expect(
      useCase.loginAdmin({ email: 'test@example.com', password: 'password' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw UnauthorizedException and increment failed attempts if password is invalid', async () => {
    adminRepository.findByEmail.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      status: 'ACTIVE',
      lockedUntil: null,
      failedLoginAttempts: 0,
    });
    hashService.compare.mockResolvedValue(false);

    await expect(
      useCase.loginAdmin({ email: 'test@example.com', password: 'password' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(adminRepository.incrementFailedLoginAttempts).toHaveBeenCalledWith(1);
  });

  it('should return tokens, reset attempts, and store token family on success', async () => {
    const admin = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      status: 'ACTIVE',
      role: 'ADMIN',
      lockedUntil: null,
      failedLoginAttempts: 0,
    };
    const tokens = {
      accessToken: 'access',
      refreshToken: 'refresh',
    };

    adminRepository.findByEmail.mockResolvedValue(admin);
    hashService.compare.mockResolvedValue(true);
    tokenService.generateTokens.mockResolvedValue(tokens);
    hashService.hash.mockResolvedValue('hashedRefresh');

    const result = await useCase.loginAdmin({
      email: 'test@example.com',
      password: 'password',
    });

    expect(result).toEqual(tokens);
    expect(adminRepository.resetFailedLoginAttempts).toHaveBeenCalledWith(admin.id);
    expect(tokenService.generateTokens).toHaveBeenCalledWith({
      sub: admin.id,
      email: admin.email,
      type: 'admin',
      role: admin.role,
    });
    expect(hashService.hash).toHaveBeenCalledWith(tokens.refreshToken);
    expect(adminRepository.updateRefreshTokenWithFamily).toHaveBeenCalledWith(
      admin.id,
      'hashedRefresh',
      expect.any(String),
    );
  });
});
