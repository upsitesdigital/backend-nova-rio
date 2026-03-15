import { type Mock, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CLIENT_AUTH_REPOSITORY } from '../../../domain/interfaces/client.repository.interface.js';
import { ADMIN_AUTH_REPOSITORY } from '../../../domain/interfaces/admin.repository.interface.js';
import { HASH_SERVICE } from '../../../domain/interfaces/hash.service.interface.js';
import { TOKEN_SERVICE } from '../../../domain/interfaces/token.service.interface.js';
import { LoginUseCase } from './login.use-case.js';

function buildRepository() {
  return {
    findByEmail: vi.fn(),
    updateRefreshToken: vi.fn(),
    incrementFailedLoginAttempts: vi.fn(),
    resetFailedLoginAttempts: vi.fn(),
    updateRefreshTokenWithFamily: vi.fn(),
  };
}

function buildActiveClient(overrides = {}) {
  return {
    id: 1,
    email: 'client@example.com',
    password: 'hashedPassword',
    status: 'ACTIVE',
    lockedUntil: null,
    failedLoginAttempts: 0,
    ...overrides,
  };
}

function buildActiveAdmin(overrides = {}) {
  return {
    id: 10,
    email: 'admin@example.com',
    password: 'hashedPassword',
    status: 'ACTIVE',
    role: 'ADMIN_MASTER',
    lockedUntil: null,
    failedLoginAttempts: 0,
    ...overrides,
  };
}

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let clientRepository: ReturnType<typeof buildRepository>;
  let adminRepository: ReturnType<typeof buildRepository>;
  let hashService: { compare: Mock; hash: Mock };
  let tokenService: { generateTokens: Mock };

  const tokens = { accessToken: 'access', refreshToken: 'refresh' };
  const dto = { email: 'user@example.com', password: 'Valid@123' };

  beforeEach(async () => {
    clientRepository = buildRepository();
    adminRepository = buildRepository();
    hashService = { compare: vi.fn(), hash: vi.fn() };
    tokenService = { generateTokens: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: CLIENT_AUTH_REPOSITORY, useValue: clientRepository },
        { provide: ADMIN_AUTH_REPOSITORY, useValue: adminRepository },
        { provide: HASH_SERVICE, useValue: hashService },
        { provide: TOKEN_SERVICE, useValue: tokenService },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('client login', () => {
    it('should return tokens with userType client on valid credentials', async () => {
      const client = buildActiveClient();
      clientRepository.findByEmail.mockResolvedValue(client);
      adminRepository.findByEmail.mockResolvedValue(null);
      hashService.compare.mockResolvedValue(true);
      tokenService.generateTokens.mockResolvedValue(tokens);
      hashService.hash.mockResolvedValue('hashedRefresh');

      const result = await useCase.authenticateUser(dto);

      expect(result).toEqual({ ...tokens, userType: 'client' });
      expect(clientRepository.resetFailedLoginAttempts).toHaveBeenCalledWith(client.id);
      expect(tokenService.generateTokens).toHaveBeenCalledWith({
        sub: client.id,
        email: client.email,
        type: 'client',
      });
      expect(clientRepository.updateRefreshTokenWithFamily).toHaveBeenCalledWith(
        client.id,
        'hashedRefresh',
        expect.any(String),
      );
    });

    it('should throw UnauthorizedException if client is locked', async () => {
      clientRepository.findByEmail.mockResolvedValue(
        buildActiveClient({ lockedUntil: new Date(Date.now() + 60_000) }),
      );
      adminRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.authenticateUser(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if client status is PENDING', async () => {
      clientRepository.findByEmail.mockResolvedValue(buildActiveClient({ status: 'PENDING' }));
      adminRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.authenticateUser(dto)).rejects.toThrow(UnauthorizedException);
      expect(hashService.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if client status is INACTIVE', async () => {
      clientRepository.findByEmail.mockResolvedValue(buildActiveClient({ status: 'INACTIVE' }));
      adminRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.authenticateUser(dto)).rejects.toThrow(UnauthorizedException);
      expect(hashService.compare).not.toHaveBeenCalled();
    });

    it('should increment failed attempts and throw on wrong password', async () => {
      clientRepository.findByEmail.mockResolvedValue(buildActiveClient());
      adminRepository.findByEmail.mockResolvedValue(null);
      hashService.compare.mockResolvedValue(false);

      await expect(useCase.authenticateUser(dto)).rejects.toThrow(UnauthorizedException);
      expect(clientRepository.incrementFailedLoginAttempts).toHaveBeenCalledWith(1);
    });
  });

  describe('admin login', () => {
    it('should return tokens with userType admin on valid credentials', async () => {
      const admin = buildActiveAdmin();
      clientRepository.findByEmail.mockResolvedValue(null);
      adminRepository.findByEmail.mockResolvedValue(admin);
      hashService.compare.mockResolvedValue(true);
      tokenService.generateTokens.mockResolvedValue(tokens);
      hashService.hash.mockResolvedValue('hashedRefresh');

      const result = await useCase.authenticateUser(dto);

      expect(result).toEqual({ ...tokens, userType: 'admin' });
      expect(tokenService.generateTokens).toHaveBeenCalledWith({
        sub: admin.id,
        email: admin.email,
        type: 'admin',
        role: admin.role,
      });
    });

    it('should throw UnauthorizedException if admin is locked', async () => {
      clientRepository.findByEmail.mockResolvedValue(null);
      adminRepository.findByEmail.mockResolvedValue(
        buildActiveAdmin({ lockedUntil: new Date(Date.now() + 60_000) }),
      );

      await expect(useCase.authenticateUser(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if admin is not active', async () => {
      clientRepository.findByEmail.mockResolvedValue(null);
      adminRepository.findByEmail.mockResolvedValue(buildActiveAdmin({ status: 'INACTIVE' }));

      await expect(useCase.authenticateUser(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should increment failed attempts and throw on wrong admin password', async () => {
      clientRepository.findByEmail.mockResolvedValue(null);
      adminRepository.findByEmail.mockResolvedValue(buildActiveAdmin());
      hashService.compare.mockResolvedValue(false);

      await expect(useCase.authenticateUser(dto)).rejects.toThrow(UnauthorizedException);
      expect(adminRepository.incrementFailedLoginAttempts).toHaveBeenCalledWith(10);
    });
  });

  describe('no user found', () => {
    it('should throw UnauthorizedException when neither client nor admin exists', async () => {
      clientRepository.findByEmail.mockResolvedValue(null);
      adminRepository.findByEmail.mockResolvedValue(null);
      hashService.compare.mockResolvedValue(false);

      await expect(useCase.authenticateUser(dto)).rejects.toThrow(UnauthorizedException);
      expect(hashService.compare).toHaveBeenCalled();
    });
  });

  describe('expired lock', () => {
    it('should allow login when lockedUntil is in the past', async () => {
      const client = buildActiveClient({ lockedUntil: new Date(Date.now() - 60_000) });
      clientRepository.findByEmail.mockResolvedValue(client);
      adminRepository.findByEmail.mockResolvedValue(null);
      hashService.compare.mockResolvedValue(true);
      tokenService.generateTokens.mockResolvedValue(tokens);
      hashService.hash.mockResolvedValue('hashedRefresh');

      const result = await useCase.authenticateUser(dto);

      expect(result.userType).toBe('client');
    });
  });

  describe('priority: client takes precedence over admin', () => {
    it('should authenticate as client when same email exists in both tables', async () => {
      const client = buildActiveClient({ email: 'shared@example.com' });
      const admin = buildActiveAdmin({ email: 'shared@example.com' });
      clientRepository.findByEmail.mockResolvedValue(client);
      adminRepository.findByEmail.mockResolvedValue(admin);
      hashService.compare.mockResolvedValue(true);
      tokenService.generateTokens.mockResolvedValue(tokens);
      hashService.hash.mockResolvedValue('hashedRefresh');

      const result = await useCase.authenticateUser(dto);

      expect(result.userType).toBe('client');
    });

    it('should reject when inactive client exists even if active admin has same email', async () => {
      clientRepository.findByEmail.mockResolvedValue(
        buildActiveClient({ status: 'INACTIVE', email: 'shared@example.com' }),
      );
      adminRepository.findByEmail.mockResolvedValue(
        buildActiveAdmin({ email: 'shared@example.com' }),
      );

      await expect(useCase.authenticateUser(dto)).rejects.toThrow(UnauthorizedException);
      expect(hashService.compare).not.toHaveBeenCalled();
    });
  });

  describe('email normalization', () => {
    it('should normalize email to lowercase and trimmed', async () => {
      clientRepository.findByEmail.mockResolvedValue(null);
      adminRepository.findByEmail.mockResolvedValue(null);
      hashService.compare.mockResolvedValue(false);

      await expect(
        useCase.authenticateUser({ email: '  USER@EXAMPLE.COM  ', password: 'Valid@123' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(clientRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
      expect(adminRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
    });
  });
});
