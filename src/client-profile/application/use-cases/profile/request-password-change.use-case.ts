import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { randomInt } from 'node:crypto';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IClientVerificationRepository } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import type { IHashService } from '../../../../auth/domain/interfaces/hash.service.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import { VerificationChannel } from '../../../../auth/domain/constants/verification-channel.constant.js';
import { VerificationType } from '../../../../auth/domain/constants/verification-type.constant.js';

@Injectable()
export class RequestPasswordChangeUseCase {
  constructor(
    @Inject(DiTokens.clientVerificationRepository)
    private clientRepository: IClientVerificationRepository,
    @Inject(DiTokens.hashService) private hashService: IHashService,
    @Inject(DiTokens.emailService) private emailService: IEmailService,
  ) {}

  async requestPasswordChange(clientId: number) {
    const client = await this.clientRepository.findById(clientId);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const code = randomInt(100000, 1000000).toString();
    const hashedCode = await this.hashService.hash(code);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.clientRepository.deleteVerificationCodesByClientId(
      clientId,
      VerificationType.passwordChange,
    );

    await this.clientRepository.createVerificationCode(
      clientId,
      hashedCode,
      VerificationType.passwordChange,
      VerificationChannel.email,
      expiresAt,
    );

    void this.emailService.sendPasswordResetCode(client.email, client.name, code);

    return { message: 'Verification code sent to your email' };
  }
}
