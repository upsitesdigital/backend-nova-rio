import { type Mock, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CLIENT_PROFILE_REPOSITORY } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import { GetClientProfileUseCase } from './get-client-profile.use-case.js';

describe('GetClientProfileUseCase', () => {
  let useCase: GetClientProfileUseCase;
  let clientRepository: { findProfileById: Mock };

  beforeEach(async () => {
    clientRepository = { findProfileById: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetClientProfileUseCase,
        { provide: CLIENT_PROFILE_REPOSITORY, useValue: clientRepository },
      ],
    }).compile();

    useCase = module.get<GetClientProfileUseCase>(GetClientProfileUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return client profile', async () => {
    const profile = {
      id: 1,
      name: 'Test',
      email: 'test@example.com',
      phone: null,
      avatarUrl: null,
      company: null,
      cpfCnpj: null,
      address: null,
      status: 'APPROVED',
      createdAt: new Date(),
    };
    clientRepository.findProfileById.mockResolvedValue(profile);

    const result = await useCase.getClientProfile(1);

    expect(result).toEqual(profile);
    expect(clientRepository.findProfileById).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException when client not found', async () => {
    clientRepository.findProfileById.mockResolvedValue(null);

    await expect(useCase.getClientProfile(999)).rejects.toThrow(NotFoundException);
  });
});
