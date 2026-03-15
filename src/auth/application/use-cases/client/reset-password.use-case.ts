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

interface AttemptRecord {
  count: number;
  firstAttemptAt: number;
}

@Injectable()
export class ResetPasswordUseCase {
  private readonly logger = new Logger(ResetPasswordUseCase.name);
  // TODO: Move to Redis/DB for persistence across restarts and horizontal scaling
  private readonly failedAttempts = new Map<string, AttemptRecord>();

  constructor(
    @Inject(CLIENT_VERIFICATION_REPOSITORY) private clientRepository: IClientVerificationRepository,
    @Inject(HASH_SERVICE) private hashService: IHashService,
    @Inject(EMAIL_SERVICE) private emailService: IEmailService,
  ) {}

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    this.checkBruteForce(dto.email);

    const client = await this.clientRepository.findByEmail(dto.email);

    if (!client) {
      this.recordFailedAttempt(dto.email);
      throw new BadRequestException('Invalid or expired code');
    }

    const activeCodes = await this.clientRepository.findActiveVerificationCodes(
      client.id,
      'PASSWORD_CHANGE',
    );

    if (activeCodes.length === 0) {
      this.recordFailedAttempt(dto.email);
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
      this.recordFailedAttempt(dto.email);

      const attempt = this.failedAttempts.get(dto.email);
      if (attempt && attempt.count >= MAX_FAILED_ATTEMPTS) {
        await this.clientRepository.deleteVerificationCodesByClientId(client.id, 'PASSWORD_CHANGE');
      }

      throw new BadRequestException('Invalid or expired code');
    }

    this.failedAttempts.delete(dto.email);

    const hashedPassword = await this.hashService.hash(dto.newPassword);

    await this.clientRepository.completePasswordReset(client.id, hashedPassword, matchedCodeId);

    this.emailService
      .sendPasswordChangedEmail(dto.email, client.name)
      .catch((err) => this.logger.error('Failed to send password changed email', err));

    return { message: 'Password reset successfully' };
  }

  private checkBruteForce(email: string): void {
    const attempt = this.failedAttempts.get(email);
    if (!attempt) return;

    const elapsed = Date.now() - attempt.firstAttemptAt;
    if (elapsed > LOCKOUT_WINDOW_MS) {
      this.failedAttempts.delete(email);
      return;
    }

    if (attempt.count >= MAX_FAILED_ATTEMPTS) {
      throw new BadRequestException('Too many failed attempts. Please request a new code.');
    }
  }

  private recordFailedAttempt(email: string): void {
    const existing = this.failedAttempts.get(email);
    const now = Date.now();

    if (existing && now - existing.firstAttemptAt < LOCKOUT_WINDOW_MS) {
      this.failedAttempts.set(email, {
        count: existing.count + 1,
        firstAttemptAt: existing.firstAttemptAt,
      });
    } else {
      this.failedAttempts.set(email, { count: 1, firstAttemptAt: now });
    }
  }
}
