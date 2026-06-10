import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CLIENT_VERIFICATION_REPOSITORY } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import type { IClientVerificationRepository } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import { HASH_SERVICE } from '../../../../auth/domain/interfaces/hash.service.interface.js';
import type { IHashService } from '../../../../auth/domain/interfaces/hash.service.interface.js';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { VerifyEmailChangeDto } from '../../../dto/profile/verify-email-change.dto.js';

@Injectable()
export class VerifyEmailChangeUseCase {
  constructor(
    @Inject(CLIENT_VERIFICATION_REPOSITORY) private clientRepository: IClientVerificationRepository,
    @Inject(HASH_SERVICE) private hashService: IHashService,
    @Inject(EMAIL_SERVICE) private emailService: IEmailService,
  ) {}

  async verifyEmailChange(clientId: number, dto: VerifyEmailChangeDto) {
    const client = await this.clientRepository.findById(clientId);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const existing = await this.clientRepository.findByEmail(dto.newEmail);

    if (existing && existing.id !== clientId) {
      throw new ConflictException('Email already in use');
    }

    const codes = await this.clientRepository.findActiveVerificationCodes(clientId, 'EMAIL_CHANGE');

    if (codes.length === 0) {
      throw new BadRequestException('No active verification code found');
    }

    let matchedCodeId: number | null = null;

    for (const record of codes) {
      const isValid = await this.hashService.compare(dto.code, record.code);

      if (isValid) {
        matchedCodeId = record.id;
        break;
      }
    }

    if (matchedCodeId === null) {
      throw new BadRequestException('Invalid verification code');
    }

    const consumed = await this.clientRepository.markVerificationCodeAsUsed(matchedCodeId);
    if (consumed === false) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.clientRepository.updateEmail(clientId, dto.newEmail);

    void this.emailService.sendEmailChangedEmail(client.email, client.name, dto.newEmail);

    return { message: 'Email updated successfully' };
  }
}
