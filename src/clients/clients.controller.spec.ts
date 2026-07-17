import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { ApproveClientUseCase } from './application/use-cases/client/approve-client.use-case.js';
import { GetClientUseCase } from './application/use-cases/client/get-client.use-case.js';
import { ListClientsUseCase } from './application/use-cases/client/list-clients.use-case.js';
import { RejectClientUseCase } from './application/use-cases/client/reject-client.use-case.js';
import { ClientsController } from './clients.controller.js';

describe('ClientsController', () => {
  let controller: ClientsController;
  let listClientsUseCase: { listClients: Mock };
  let getClientUseCase: { getClientById: Mock };
  let approveClientUseCase: { approveClientById: Mock };
  let rejectClientUseCase: { rejectClientById: Mock };

  beforeEach(async () => {
    listClientsUseCase = { listClients: vi.fn() };
    getClientUseCase = { getClientById: vi.fn() };
    approveClientUseCase = { approveClientById: vi.fn() };
    rejectClientUseCase = { rejectClientById: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        { provide: ListClientsUseCase, useValue: listClientsUseCase },
        { provide: GetClientUseCase, useValue: getClientUseCase },
        { provide: ApproveClientUseCase, useValue: approveClientUseCase },
        { provide: RejectClientUseCase, useValue: rejectClientUseCase },
      ],
    }).compile();

    controller = module.get<ClientsController>(ClientsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('listClients should call use case with query params', async () => {
    const query = { status: 'PENDING' as const, page: 1, limit: 10 };
    const paginated = { data: [], total: 0, page: 1, limit: 20 };
    listClientsUseCase.listClients.mockResolvedValue(paginated);

    const result = await controller.listClients(query);

    expect(result).toEqual(paginated);
    expect(listClientsUseCase.listClients).toHaveBeenCalledWith(query);
  });

  it('listClients should call use case with search param', async () => {
    const query = { search: 'joao', page: 1, limit: 10 };
    const paginated = { data: [], total: 0, page: 1, limit: 20 };
    listClientsUseCase.listClients.mockResolvedValue(paginated);

    const result = await controller.listClients(query);

    expect(result).toEqual(paginated);
    expect(listClientsUseCase.listClients).toHaveBeenCalledWith(query);
  });

  it('getClientById should call use case with id', async () => {
    await controller.getClientById(1);

    expect(getClientUseCase.getClientById).toHaveBeenCalledWith(1);
  });

  it('approveClientById should call use case with id', async () => {
    await controller.approveClientById(5);

    expect(approveClientUseCase.approveClientById).toHaveBeenCalledWith(5);
  });

  it('rejectClientById should call use case with id', async () => {
    await controller.rejectClientById(3);

    expect(rejectClientUseCase.rejectClientById).toHaveBeenCalledWith(3);
  });
});
