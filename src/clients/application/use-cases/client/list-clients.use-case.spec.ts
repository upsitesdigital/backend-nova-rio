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
    const paginated = { data: [{ id: 1, name: 'João' }], total: 1, page: 1, limit: 20 };
    clientMgmtRepository.listClients.mockResolvedValue(paginated);

    const result = await useCase.listClients({});

    expect(result).toEqual(paginated);
    expect(clientMgmtRepository.listClients).toHaveBeenCalledWith({
      status: undefined,
      search: undefined,
      page: undefined,
      limit: undefined,
    });
  });

  it('should pass status and search filters to repository', async () => {
    const paginated = { data: [], total: 0, page: 1, limit: 20 };
    clientMgmtRepository.listClients.mockResolvedValue(paginated);

    await useCase.listClients({ status: 'PENDING', search: 'maria' });

    expect(clientMgmtRepository.listClients).toHaveBeenCalledWith({
      status: 'PENDING',
      search: 'maria',
      page: undefined,
      limit: undefined,
    });
  });

  it('should pass page and limit to repository', async () => {
    const paginated = { data: [], total: 0, page: 2, limit: 10 };
    clientMgmtRepository.listClients.mockResolvedValue(paginated);

    await useCase.listClients({ page: 2, limit: 10 });

    expect(clientMgmtRepository.listClients).toHaveBeenCalledWith({
      status: undefined,
      search: undefined,
      page: 2,
      limit: 10,
    });
  });
});
