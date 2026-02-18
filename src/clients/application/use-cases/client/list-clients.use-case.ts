import { Inject, Injectable } from '@nestjs/common';
import { CLIENT_MGMT_REPOSITORY } from '../../../domain/interfaces/client-management.repository.interface.js';
import type {
  ClientSafe,
  IClientManagementRepository,
} from '../../../domain/interfaces/client-management.repository.interface.js';
import { ListClientsQueryDto } from '../../../dto/client/list-clients-query.dto.js';

@Injectable()
export class ListClientsUseCase {
  constructor(
    @Inject(CLIENT_MGMT_REPOSITORY) private clientMgmtRepository: IClientManagementRepository,
  ) {}

  async listClients(query: ListClientsQueryDto): Promise<ClientSafe[]> {
    return this.clientMgmtRepository.listClients({
      status: query.status,
      search: query.search,
    });
  }
}
