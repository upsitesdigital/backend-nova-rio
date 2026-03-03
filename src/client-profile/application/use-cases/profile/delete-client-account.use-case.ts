import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CLIENT_REPOSITORY } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import type { IClientRepository } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { DeleteAccountDto } from '../../../dto/profile/delete-account.dto.js';

const CONFIRM_PHRASE = 'Apagar minha conta';

@Injectable()
export class DeleteClientAccountUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY) private clientRepository: IClientRepository,
    @Inject(EMAIL_SERVICE) private emailService: IEmailService,
  ) {}

  async deleteClientAccount(clientId: number, dto: DeleteAccountDto) {
    if (dto.confirmPhrase !== CONFIRM_PHRASE) {
      throw new BadRequestException('Invalid confirmation phrase');
    }
    const client = await this.clientRepository.findById(clientId);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    await this.clientRepository.deactivateClient(clientId);

    void this.emailService.sendAccountDeletedEmail(client.email, client.name);

    return { message: 'Account deleted successfully' };
  }
}
