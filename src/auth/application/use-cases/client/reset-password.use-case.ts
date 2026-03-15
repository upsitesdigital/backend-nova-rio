import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { CLIENT_VERIFICATION_REPOSITORY } from '../../../domain/interfaces/client.repository.interface.js';
import type { IClientVerificationRepository } from '../../../domain/interfaces/client.repository.interface.js';
import { HASH_SERVICE } from '../../../domain/interfaces/hash.service.interface.js';
import type { IHashService } from '../../../domain/interfaces/hash.service.interface.js';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import { ResetPasswordDto } from '../../../dto/reset-password.dto.js';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

@Injectable()
export class ResetPasswordUseCase {
  private readonly logger = new Logger(ResetPasswordUseCase.name);

  constructor(
    @Inject(CLIENT_VERIFICATION_REPOSITORY) private clientRepository: IClientVerificationRepository,
    @Inject(HASH_SERVICE) private hashService: IHashService,
    @Inject(EMAIL_SERVICE) private emailService: IEmailService,
  ) {}

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const client = await this.clientRepository.findByEmail(dto.email);

    if (!client) {
      throw new BadRequestException('Invalid or expired code');
    }

    await this.checkBruteForce(client.id);

    const activeCodes = await this.clientRepository.findActiveVerificationCodes(
      client.id,
      'PASSWORD_CHANGE',
    );

    if (activeCodes.length === 0) {
      await this.recordFailedAttempt(client.id);
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
      await this.recordFailedAttempt(client.id);

      const { failedResetAttempts } = await this.clientRepository.getResetAttempts(client.id);
      if (failedResetAttempts >= MAX_FAILED_ATTEMPTS) {
        await this.clientRepository.deleteVerificationCodesByClientId(client.id, 'PASSWORD_CHANGE');
      }

      throw new BadRequestException('Invalid or expired code');
    }

    await this.clientRepository.clearResetAttempts(client.id);

    const hashedPassword = await this.hashService.hash(dto.newPassword);

    await this.clientRepository.completePasswordReset(client.id, hashedPassword, matchedCodeId);

    this.emailService
      .sendPasswordChangedEmail(dto.email, client.name)
      .catch((err) => this.logger.error('Failed to send password changed email', err));

    return { message: 'Password reset successfully' };
  }

  private async checkBruteForce(clientId: number): Promise<void> {
    const { failedResetAttempts, resetLockedUntil } =
      await this.clientRepository.getResetAttempts(clientId);

    if (resetLockedUntil && resetLockedUntil > new Date()) {
      throw new BadRequestException('Too many failed attempts. Please request a new code.');
    }

    if (resetLockedUntil && resetLockedUntil <= new Date()) {
      await this.clientRepository.clearResetAttempts(clientId);
      return;
    }

    if (failedResetAttempts >= MAX_FAILED_ATTEMPTS) {
      throw new BadRequestException('Too many failed attempts. Please request a new code.');
    }
  }

  private async recordFailedAttempt(clientId: number): Promise<void> {
    const { failedResetAttempts } = await this.clientRepository.getResetAttempts(clientId);
    const newCount = failedResetAttempts + 1;
    const lockUntil =
      newCount >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_WINDOW_MS) : null;

    await this.clientRepository.incrementResetAttempts(clientId, lockUntil);
  }
}
