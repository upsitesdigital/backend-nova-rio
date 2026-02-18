import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CLIENT_MGMT_REPOSITORY } from '../../../domain/interfaces/client-management.repository.interface.js';
import type { IClientManagementRepository } from '../../../domain/interfaces/client-management.repository.interface.js';

@Injectable()
export class ApproveClientUseCase {
  constructor(
    @Inject(CLIENT_MGMT_REPOSITORY) private clientMgmtRepository: IClientManagementRepository,
  ) {}

  async approveClientById(id: number): Promise<void> {
    const client = await this.clientMgmtRepository.findClientById(id);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    if (client.status !== 'PENDING') {
      throw new BadRequestException('Only pending clients can be approved');
    }

    await this.clientMgmtRepository.approveClientById(id);
  }
}
