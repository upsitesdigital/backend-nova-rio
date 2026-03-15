import { type Mock, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CLIENT_PROFILE_REPOSITORY } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import { PROFILE_REPOSITORY } from '../../../domain/interfaces/client-profile.repository.interface.js';
import { UpdateClientProfileUseCase } from './update-client-profile.use-case.js';

describe('UpdateClientProfileUseCase', () => {
  let useCase: UpdateClientProfileUseCase;
  let clientRepository: { findById: Mock };
  let profileRepository: { updateProfile: Mock };

  beforeEach(async () => {
    clientRepository = { findById: vi.fn() };
    profileRepository = { updateProfile: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateClientProfileUseCase,
        { provide: CLIENT_PROFILE_REPOSITORY, useValue: clientRepository },
        { provide: PROFILE_REPOSITORY, useValue: profileRepository },
      ],
    }).compile();

    useCase = module.get<UpdateClientProfileUseCase>(UpdateClientProfileUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update profile and return updated data', async () => {
    const client = { id: 1, name: 'Test', email: 'test@example.com' };
    const updatedProfile = {
      id: 1,
      name: 'Updated Name',
      email: 'test@example.com',
      phone: '+5521999999999',
      avatarUrl: null,
      company: null,
      cpfCnpj: null,
      address: null,
      status: 'APPROVED',
      createdAt: new Date(),
    };
    clientRepository.findById.mockResolvedValue(client);
    profileRepository.updateProfile.mockResolvedValue(updatedProfile);

    const result = await useCase.updateClientProfile(1, {
      name: 'Updated Name',
      phone: '+5521999999999',
    });

    expect(result).toEqual(updatedProfile);
    expect(profileRepository.updateProfile).toHaveBeenCalledWith(1, {
      name: 'Updated Name',
      phone: '+5521999999999',
    });
  });

  it('should throw NotFoundException when client not found', async () => {
    clientRepository.findById.mockResolvedValue(null);

    await expect(useCase.updateClientProfile(999, { name: 'Test' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
