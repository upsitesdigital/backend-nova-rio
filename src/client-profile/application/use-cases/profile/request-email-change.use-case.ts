import { randomInt } from 'node:crypto';
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CLIENT_REPOSITORY } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import type { IClientRepository } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import { HASH_SERVICE } from '../../../../auth/domain/interfaces/hash.service.interface.js';
import type { IHashService } from '../../../../auth/domain/interfaces/hash.service.interface.js';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { RequestEmailChangeDto } from '../../../dto/profile/request-email-change.dto.js';

@Injectable()
export class RequestEmailChangeUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY) private clientRepository: IClientRepository,
    @Inject(HASH_SERVICE) private hashService: IHashService,
    @Inject(EMAIL_SERVICE) private emailService: IEmailService,
  ) {}

  async requestEmailChange(clientId: number, dto: RequestEmailChangeDto) {
    const client = await this.clientRepository.findById(clientId);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const existing = await this.clientRepository.findByEmail(dto.newEmail);

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const code = randomInt(100000, 1000000).toString();
    const hashedCode = await this.hashService.hash(code);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.clientRepository.deleteVerificationCodesByClientId(clientId, 'EMAIL_CHANGE');

    await this.clientRepository.createVerificationCode(
      clientId,
      hashedCode,
      'EMAIL_CHANGE',
      'EMAIL',
      expiresAt,
    );

    void this.emailService.sendEmailChangeVerification(dto.newEmail, client.name, code);

    return { message: 'Verification code sent to the new email' };
  }
}
