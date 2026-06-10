import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { type Mock, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GetProfileUseCase } from './get-profile.use-case.js';

describe('GetProfileUseCase', () => {
  let useCase: GetProfileUseCase;
  let clientRepository: { findProfileById: Mock };
  let adminRepository: { findProfileById: Mock };

  beforeEach(async () => {
    clientRepository = {
      findProfileById: vi.fn(),
    };
    adminRepository = {
      findProfileById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProfileUseCase,
        { provide: DiTokens.clientProfileRepository, useValue: clientRepository },
        { provide: DiTokens.adminProfileRepository, useValue: adminRepository },
      ],
    }).compile();

    useCase = module.get<GetProfileUseCase>(GetProfileUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return client profile if user type is client', async () => {
    const profile = { id: 1, name: 'Client' };
    clientRepository.findProfileById.mockResolvedValue(profile);

    const result = await useCase.getProfile({ id: 1, type: 'client', email: 'test@test.com' });

    expect(result).toEqual(profile);
    expect(clientRepository.findProfileById).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException if client profile not found', async () => {
    clientRepository.findProfileById.mockResolvedValue(null);

    await expect(
      useCase.getProfile({ id: 1, type: 'client', email: 'test@test.com' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should return admin profile if user type is admin', async () => {
    const profile = { id: 1, name: 'Admin' };
    adminRepository.findProfileById.mockResolvedValue(profile);

    const result = await useCase.getProfile({ id: 1, type: 'admin', email: 'test@test.com' });

    expect(result).toEqual(profile);
    expect(adminRepository.findProfileById).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException if admin profile not found', async () => {
    adminRepository.findProfileById.mockResolvedValue(null);

    await expect(
      useCase.getProfile({ id: 1, type: 'admin', email: 'test@test.com' }),
    ).rejects.toThrow(NotFoundException);
  });
});
