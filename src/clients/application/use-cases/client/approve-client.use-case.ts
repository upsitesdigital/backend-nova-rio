import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CLIENT_MGMT_REPOSITORY } from '../../../domain/interfaces/client-management.repository.interface.js';
import type { IClientManagementRepository } from '../../../domain/interfaces/client-management.repository.interface.js';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';

@Injectable()
export class ApproveClientUseCase {
  constructor(
    @Inject(CLIENT_MGMT_REPOSITORY) private clientMgmtRepository: IClientManagementRepository,
    @Inject(EMAIL_SERVICE) private emailService: IEmailService,
  ) {}

  async approveClientById(id: number): Promise<void> {
    const client = await this.clientMgmtRepository.findClientById(id);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    if (client.status !== 'PENDING') {
      throw new BadRequestException('Only pending clients can be approved');
    }

    const approved = await this.clientMgmtRepository.approveClientById(id);
    if (approved === false) {
      throw new BadRequestException('Only pending clients can be approved');
    }

    void this.emailService.sendClientApprovedEmail(client.email, client.name);
  }
}
