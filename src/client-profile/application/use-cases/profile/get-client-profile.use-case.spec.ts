import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { type Mock, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetClientProfileUseCase } from './get-client-profile.use-case.js';

describe('GetClientProfileUseCase', () => {
  let useCase: GetClientProfileUseCase;
  let clientRepository: { findClientProfileById: Mock };

  beforeEach(async () => {
    clientRepository = { findClientProfileById: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetClientProfileUseCase,
        { provide: DiTokens.profileRepository, useValue: clientRepository },
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
    clientRepository.findClientProfileById.mockResolvedValue(profile);

    const result = await useCase.getClientProfile(1);

    expect(result).toEqual(profile);
    expect(clientRepository.findClientProfileById).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException when client not found', async () => {
    clientRepository.findClientProfileById.mockResolvedValue(null);

    await expect(useCase.getClientProfile(999)).rejects.toThrow(NotFoundException);
  });
});
