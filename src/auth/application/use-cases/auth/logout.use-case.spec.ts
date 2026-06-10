import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { type Mock, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import type { AuthUser } from '../../../../shared/types/auth-user.type.js';
import { LogoutUseCase } from './logout.use-case.js';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let clientRepository: { revokeTokenFamily: Mock };
  let adminRepository: { revokeTokenFamily: Mock };

  beforeEach(async () => {
    clientRepository = { revokeTokenFamily: vi.fn().mockResolvedValue(undefined) };
    adminRepository = { revokeTokenFamily: vi.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutUseCase,
        { provide: DiTokens.clientAuthRepository, useValue: clientRepository },
        { provide: DiTokens.adminAuthRepository, useValue: adminRepository },
      ],
    }).compile();

    useCase = module.get<LogoutUseCase>(LogoutUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should revoke the token family for a client and return a generic message', async () => {
    const user: AuthUser = { id: 1, type: 'client', email: 'test@test.com' };

    const result = await useCase.logout(user);

    expect(clientRepository.revokeTokenFamily).toHaveBeenCalledWith(1);
    expect(adminRepository.revokeTokenFamily).not.toHaveBeenCalled();
    expect(result).toEqual({ message: 'Logged out successfully' });
  });

  it('should revoke the token family for an admin', async () => {
    const user: AuthUser = { id: 2, type: 'admin', email: 'admin@test.com' };

    const result = await useCase.logout(user);

    expect(adminRepository.revokeTokenFamily).toHaveBeenCalledWith(2);
    expect(clientRepository.revokeTokenFamily).not.toHaveBeenCalled();
    expect(result).toEqual({ message: 'Logged out successfully' });
  });
});
