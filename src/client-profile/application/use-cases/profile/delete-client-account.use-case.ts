import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IClientProfileRepository } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';

@Injectable()
export class DeleteClientAccountUseCase {
  constructor(
    @Inject(DiTokens.clientProfileRepository) private clientRepository: IClientProfileRepository,
    @Inject(DiTokens.emailService) private emailService: IEmailService,
  ) {}

  async deleteClientAccount(clientId: number) {
    const client = await this.clientRepository.findById(clientId);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    await this.clientRepository.deactivateClient(clientId);

    void this.emailService.sendAccountDeletedEmail(client.email, client.name);

    return { message: 'Account deleted successfully' };
  }
}
