import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import type { IClientManagementRepository } from '../../../domain/interfaces/client-management.repository.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';

@Injectable()
export class RejectClientUseCase {
  constructor(
    @Inject(DiTokens.clientManagementRepository)
    private clientMgmtRepository: IClientManagementRepository,
    @Inject(DiTokens.emailService) private emailService: IEmailService,
  ) {}

  async rejectClientById(id: number): Promise<void> {
    const client = await this.clientMgmtRepository.findClientById(id);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    if (client.status !== UserStatus.PENDING) {
      throw new BadRequestException('Only pending clients can be rejected');
    }

    const rejected = await this.clientMgmtRepository.rejectClientById(id);
    if (rejected === false) {
      throw new BadRequestException('Only pending clients can be rejected');
    }

    void this.emailService.sendClientRejectedEmail(client.email, client.name);
  }
}
