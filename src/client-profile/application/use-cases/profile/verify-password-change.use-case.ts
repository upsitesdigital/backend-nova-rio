import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CLIENT_VERIFICATION_REPOSITORY } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import type { IClientVerificationRepository } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import { HASH_SERVICE } from '../../../../auth/domain/interfaces/hash.service.interface.js';
import type { IHashService } from '../../../../auth/domain/interfaces/hash.service.interface.js';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { VerifyPasswordChangeDto } from '../../../dto/profile/verify-password-change.dto.js';

@Injectable()
export class VerifyPasswordChangeUseCase {
  constructor(
    @Inject(CLIENT_VERIFICATION_REPOSITORY) private clientRepository: IClientVerificationRepository,
    @Inject(HASH_SERVICE) private hashService: IHashService,
    @Inject(EMAIL_SERVICE) private emailService: IEmailService,
  ) {}

  async verifyPasswordChange(clientId: number, dto: VerifyPasswordChangeDto) {
    const client = await this.clientRepository.findById(clientId);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const codes = await this.clientRepository.findActiveVerificationCodes(
      clientId,
      'PASSWORD_CHANGE',
    );

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

    const hashedPassword = await this.hashService.hash(dto.newPassword);

    await this.clientRepository.markVerificationCodeAsUsed(matchedCodeId);
    await this.clientRepository.updatePassword(clientId, hashedPassword);

    void this.emailService.sendPasswordChangedEmail(client.email, client.name);

    return { message: 'Password updated successfully' };
  }
}
