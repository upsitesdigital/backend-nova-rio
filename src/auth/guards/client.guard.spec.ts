import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { CLIENT_REPOSITORY } from '../domain/interfaces/client.repository.interface.js';
import { ClientGuard } from './client.guard.js';

describe('ClientGuard', () => {
  let guard: ClientGuard;
  let clientRepository: { findById: Mock };

  beforeEach(async () => {
    clientRepository = {
      findById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientGuard, { provide: CLIENT_REPOSITORY, useValue: clientRepository }],
    }).compile();

    guard = module.get<ClientGuard>(ClientGuard);
  });

  const mockContext = (userType: string, userId = 1): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId, email: 'test@test.com', type: userType },
        }),
      }),
    }) as unknown as ExecutionContext;

  it('should allow active client users', async () => {
    clientRepository.findById.mockResolvedValue({ id: 1, status: 'ACTIVE' });

    const result = await guard.canActivate(mockContext('client'));

    expect(result).toBe(true);
    expect(clientRepository.findById).toHaveBeenCalledWith(1);
  });

  it('should throw ForbiddenException for admin users', async () => {
    await expect(guard.canActivate(mockContext('admin'))).rejects.toThrow(ForbiddenException);
    expect(clientRepository.findById).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException for PENDING client', async () => {
    clientRepository.findById.mockResolvedValue({ id: 1, status: 'PENDING' });

    await expect(guard.canActivate(mockContext('client'))).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException for INACTIVE client', async () => {
    clientRepository.findById.mockResolvedValue({ id: 1, status: 'INACTIVE' });

    await expect(guard.canActivate(mockContext('client'))).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when client not found', async () => {
    clientRepository.findById.mockResolvedValue(null);

    await expect(guard.canActivate(mockContext('client'))).rejects.toThrow(ForbiddenException);
  });
});
