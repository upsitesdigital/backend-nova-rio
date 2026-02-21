import { randomInt } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { CLIENT_REPOSITORY } from '../../../domain/interfaces/client.repository.interface.js';
import type { IClientRepository } from '../../../domain/interfaces/client.repository.interface.js';
import { HASH_SERVICE } from '../../../domain/interfaces/hash.service.interface.js';
import type { IHashService } from '../../../domain/interfaces/hash.service.interface.js';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import { ForgotPasswordDto } from '../../../dto/forgot-password.dto.js';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY) private clientRepository: IClientRepository,
    @Inject(HASH_SERVICE) private hashService: IHashService,
    @Inject(EMAIL_SERVICE) private emailService: IEmailService,
  ) {}

  async requestPasswordReset(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const client = await this.clientRepository.findByEmail(dto.email);

    if (!client) {
      return { message: 'If the email exists, a verification code was sent' };
    }

    const code = randomInt(100000, 1000000).toString();
    const hashedCode = await this.hashService.hash(code);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.clientRepository.deleteVerificationCodesByClientId(client.id, 'PASSWORD_CHANGE');

    await this.clientRepository.createVerificationCode(
      client.id,
      hashedCode,
      'PASSWORD_CHANGE',
      'EMAIL',
      expiresAt,
    );

    void this.emailService.sendPasswordResetCode(dto.email, client.name, code);

    return { message: 'If the email exists, a verification code was sent' };
  }
}
