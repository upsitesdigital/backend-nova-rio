import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import type { IClientVerificationRepository } from '../../../domain/interfaces/client.repository.interface.js';
import type { IHashService } from '../../../domain/interfaces/hash.service.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import { VerificationType } from '../../../domain/constants/verification-type.constant.js';
import type { ResetPasswordDto } from '../../../dto/reset-password.dto.js';

const MAX_FAILED_ATTEMPTS = 5;
@Injectable()
export class ResetPasswordUseCase {
  private readonly logger = new Logger(ResetPasswordUseCase.name);

  constructor(
    @Inject(DiTokens.clientVerificationRepository)
    private clientRepository: IClientVerificationRepository,
    @Inject(DiTokens.hashService) private hashService: IHashService,
    @Inject(DiTokens.emailService) private emailService: IEmailService,
  ) {}

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const client = await this.clientRepository.findByEmail(dto.email);

    if (!client) {
      throw new BadRequestException('Invalid or expired code');
    }

    const attempt = await this.clientRepository.reserveResetAttempt(client.id);
    if (!attempt.allowed) {
      throw new BadRequestException('Invalid or expired code');
    }

    const activeCodes = await this.clientRepository.findActiveVerificationCodes(
      client.id,
      VerificationType.passwordChange,
    );

    if (activeCodes.length === 0) {
      throw new BadRequestException('Invalid or expired code');
    }

    let matchedCodeId: number | null = null;

    for (const record of activeCodes) {
      const isMatch = await this.hashService.compare(dto.code, record.code);
      if (isMatch) {
        matchedCodeId = record.id;
        break;
      }
    }

    if (matchedCodeId === null) {
      if (attempt.failedResetAttempts >= MAX_FAILED_ATTEMPTS) {
        await this.clientRepository.deleteVerificationCodesByClientId(
          client.id,
          VerificationType.passwordChange,
        );
      }

      throw new BadRequestException('Invalid or expired code');
    }

    const hashedPassword = await this.hashService.hash(dto.newPassword);

    const completed = await this.clientRepository.completePasswordReset(
      client.id,
      matchedCodeId,
      hashedPassword,
    );

    if (completed === false) {
      throw new BadRequestException('Invalid or expired code');
    }

    await this.clientRepository.clearResetAttempts(client.id);

    this.emailService
      .sendPasswordChangedEmail(dto.email, client.name)
      .catch((err) => this.logger.error('Failed to send password changed email', err));

    return { message: 'Password reset successfully' };
  }
}
