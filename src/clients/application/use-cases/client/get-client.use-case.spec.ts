import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { CLIENT_MGMT_REPOSITORY } from '../../../domain/interfaces/client-management.repository.interface.js';
import { GetClientUseCase } from './get-client.use-case.js';

describe('GetClientUseCase', () => {
  let useCase: GetClientUseCase;
  let clientMgmtRepository: { findClientById: Mock };

  beforeEach(async () => {
    clientMgmtRepository = { findClientById: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetClientUseCase,
        { provide: CLIENT_MGMT_REPOSITORY, useValue: clientMgmtRepository },
      ],
    }).compile();

    useCase = module.get<GetClientUseCase>(GetClientUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return a client by id', async () => {
    const client = { id: 1, name: 'João', email: 'joao@test.com', status: 'ACTIVE' };
    clientMgmtRepository.findClientById.mockResolvedValue(client);

    const result = await useCase.getClientById(1);

    expect(result).toEqual(client);
    expect(clientMgmtRepository.findClientById).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException when client not found', async () => {
    clientMgmtRepository.findClientById.mockResolvedValue(null);

    await expect(useCase.getClientById(999)).rejects.toThrow(NotFoundException);
  });
});
