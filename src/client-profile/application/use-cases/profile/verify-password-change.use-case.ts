import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IClientVerificationRepository } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import type { IHashService } from '../../../../auth/domain/interfaces/hash.service.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import { VerificationType } from '../../../../auth/domain/constants/verification-type.constant.js';
import type { VerifyPasswordChangeDto } from '../../../dto/profile/verify-password-change.dto.js';

@Injectable()
export class VerifyPasswordChangeUseCase {
  constructor(
    @Inject(DiTokens.clientVerificationRepository)
    private clientRepository: IClientVerificationRepository,
    @Inject(DiTokens.hashService) private hashService: IHashService,
    @Inject(DiTokens.emailService) private emailService: IEmailService,
  ) {}

  async verifyPasswordChange(clientId: number, dto: VerifyPasswordChangeDto) {
    const client = await this.clientRepository.findById(clientId);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const codes = await this.clientRepository.findActiveVerificationCodes(
      clientId,
      VerificationType.passwordChange,
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

    const consumed = await this.clientRepository.markVerificationCodeAsUsed(matchedCodeId);
    if (consumed === false) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.clientRepository.updatePassword(clientId, hashedPassword);

    void this.emailService.sendPasswordChangedEmail(client.email, client.name);

    return { message: 'Password updated successfully' };
  }
}
