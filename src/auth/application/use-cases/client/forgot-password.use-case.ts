import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { randomInt } from 'node:crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IClientVerificationRepository } from '../../../domain/interfaces/client.repository.interface.js';
import type { IHashService } from '../../../domain/interfaces/hash.service.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import { VerificationChannel } from '../../../domain/constants/verification-channel.constant.js';
import { VerificationType } from '../../../domain/constants/verification-type.constant.js';
import { ForgotPasswordDto } from '../../../dto/forgot-password.dto.js';

@Injectable()
export class ForgotPasswordUseCase {
  private readonly logger = new Logger(ForgotPasswordUseCase.name);

  constructor(
    @Inject(DiTokens.clientVerificationRepository)
    private clientRepository: IClientVerificationRepository,
    @Inject(DiTokens.hashService) private hashService: IHashService,
    @Inject(DiTokens.emailService) private emailService: IEmailService,
  ) {}

  async requestPasswordReset(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const client = await this.clientRepository.findByEmail(dto.email);

    if (!client) {
      return { message: 'If the email exists, a verification code was sent' };
    }

    const code = randomInt(100000, 1000000).toString();
    const hashedCode = await this.hashService.hash(code);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.clientRepository.deleteVerificationCodesByClientId(
      client.id,
      VerificationType.passwordChange,
    );

    await this.clientRepository.createVerificationCode(
      client.id,
      hashedCode,
      VerificationType.passwordChange,
      VerificationChannel.email,
      expiresAt,
    );

    this.emailService
      .sendPasswordResetCode(dto.email, client.name, code)
      .catch((err) => this.logger.error('Failed to send password reset code', err));

    return { message: 'If the email exists, a verification code was sent' };
  }
}
