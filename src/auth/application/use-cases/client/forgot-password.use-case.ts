import { Inject, Injectable } from '@nestjs/common';
import { CLIENT_REPOSITORY } from '../../../domain/interfaces/client.repository.interface.js';
import type { IClientRepository } from '../../../domain/interfaces/client.repository.interface.js';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import { ForgotPasswordDto } from '../../../dto/forgot-password.dto.js';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY) private clientRepository: IClientRepository,
    @Inject(EMAIL_SERVICE) private emailService: IEmailService,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const client = await this.clientRepository.findByEmail(dto.email);

    if (!client) {
      return { message: 'If the email exists, a verification code was sent' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.clientRepository.createVerificationCode(
      client.id,
      code,
      'PASSWORD_CHANGE',
      'EMAIL',
      expiresAt,
    );

    void this.emailService.sendPasswordResetCode(dto.email, client.name, code);

    return { message: 'If the email exists, a verification code was sent' };
  }
}
