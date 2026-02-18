import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { CLIENT_MGMT_REPOSITORY } from '../../../domain/interfaces/client-management.repository.interface.js';
import { ListClientsUseCase } from './list-clients.use-case.js';

describe('ListClientsUseCase', () => {
  let useCase: ListClientsUseCase;
  let clientMgmtRepository: { listClients: Mock };

  beforeEach(async () => {
    clientMgmtRepository = { listClients: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListClientsUseCase,
        { provide: CLIENT_MGMT_REPOSITORY, useValue: clientMgmtRepository },
      ],
    }).compile();

    useCase = module.get<ListClientsUseCase>(ListClientsUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should list clients without filters', async () => {
    const clients = [{ id: 1, name: 'João' }];
    clientMgmtRepository.listClients.mockResolvedValue(clients);

    const result = await useCase.listClients({});

    expect(result).toEqual(clients);
    expect(clientMgmtRepository.listClients).toHaveBeenCalledWith({
      status: undefined,
      search: undefined,
    });
  });

  it('should pass status and search filters to repository', async () => {
    clientMgmtRepository.listClients.mockResolvedValue([]);

    await useCase.listClients({ status: 'PENDING', search: 'maria' });

    expect(clientMgmtRepository.listClients).toHaveBeenCalledWith({
      status: 'PENDING',
      search: 'maria',
    });
  });
});
