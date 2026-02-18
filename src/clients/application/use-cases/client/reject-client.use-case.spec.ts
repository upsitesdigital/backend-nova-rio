import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { CLIENT_MGMT_REPOSITORY } from '../../../domain/interfaces/client-management.repository.interface.js';
import { RejectClientUseCase } from './reject-client.use-case.js';

describe('RejectClientUseCase', () => {
  let useCase: RejectClientUseCase;
  let clientMgmtRepository: { findClientById: Mock; rejectClientById: Mock };

  beforeEach(async () => {
    clientMgmtRepository = {
      findClientById: vi.fn(),
      rejectClientById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RejectClientUseCase,
        { provide: CLIENT_MGMT_REPOSITORY, useValue: clientMgmtRepository },
      ],
    }).compile();

    useCase = module.get<RejectClientUseCase>(RejectClientUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should reject a PENDING client', async () => {
    const client = { id: 1, name: 'João', status: 'PENDING' };

    clientMgmtRepository.findClientById.mockResolvedValue(client);
    clientMgmtRepository.rejectClientById.mockResolvedValue(undefined);

    await useCase.rejectClientById(1);

    expect(clientMgmtRepository.findClientById).toHaveBeenCalledWith(1);
    expect(clientMgmtRepository.rejectClientById).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException when client not found', async () => {
    clientMgmtRepository.findClientById.mockResolvedValue(null);

    await expect(useCase.rejectClientById(999)).rejects.toThrow(NotFoundException);
    expect(clientMgmtRepository.rejectClientById).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when client is ACTIVE', async () => {
    const client = { id: 1, name: 'João', status: 'ACTIVE' };
    clientMgmtRepository.findClientById.mockResolvedValue(client);

    await expect(useCase.rejectClientById(1)).rejects.toThrow(BadRequestException);
    expect(clientMgmtRepository.rejectClientById).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when client is INACTIVE', async () => {
    const client = { id: 1, name: 'João', status: 'INACTIVE' };
    clientMgmtRepository.findClientById.mockResolvedValue(client);

    await expect(useCase.rejectClientById(1)).rejects.toThrow(BadRequestException);
    expect(clientMgmtRepository.rejectClientById).not.toHaveBeenCalled();
  });
});
