import { randomInt } from 'node:crypto';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CLIENT_REPOSITORY } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import type { IClientRepository } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import { HASH_SERVICE } from '../../../../auth/domain/interfaces/hash.service.interface.js';
import type { IHashService } from '../../../../auth/domain/interfaces/hash.service.interface.js';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';

@Injectable()
export class RequestPasswordChangeUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY) private clientRepository: IClientRepository,
    @Inject(HASH_SERVICE) private hashService: IHashService,
    @Inject(EMAIL_SERVICE) private emailService: IEmailService,
  ) {}

  async requestPasswordChange(clientId: number) {
    const client = await this.clientRepository.findById(clientId);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const code = randomInt(100000, 1000000).toString();
    const hashedCode = await this.hashService.hash(code);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.clientRepository.deleteVerificationCodesByClientId(clientId, 'PASSWORD_CHANGE');

    await this.clientRepository.createVerificationCode(
      clientId,
      hashedCode,
      'PASSWORD_CHANGE',
      'EMAIL',
      expiresAt,
    );

    void this.emailService.sendPasswordResetCode(client.email, client.name, code);

    return { message: 'Verification code sent to your email' };
  }
}
