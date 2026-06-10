import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable } from '@nestjs/common';
import type { PaginatedResponse } from '../../../../shared/types/paginated-response.type.js';
import type {
  ClientSafe,
  IClientManagementRepository,
} from '../../../domain/interfaces/client-management.repository.interface.js';
import { ListClientsQueryDto } from '../../../dto/client/list-clients-query.dto.js';

@Injectable()
export class ListClientsUseCase {
  constructor(
    @Inject(DiTokens.clientManagementRepository)
    private clientMgmtRepository: IClientManagementRepository,
  ) {}

  async listClients(query: ListClientsQueryDto): Promise<PaginatedResponse<ClientSafe>> {
    return this.clientMgmtRepository.listClients({
      status: query.status,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });
  }
}
