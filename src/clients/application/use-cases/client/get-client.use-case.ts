import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  ClientSafe,
  IClientManagementRepository,
} from '../../../domain/interfaces/client-management.repository.interface.js';

@Injectable()
export class GetClientUseCase {
  constructor(
    @Inject(DiTokens.clientManagementRepository)
    private clientMgmtRepository: IClientManagementRepository,
  ) {}

  async getClientById(id: number): Promise<ClientSafe> {
    const client = await this.clientMgmtRepository.findClientById(id);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }
}
