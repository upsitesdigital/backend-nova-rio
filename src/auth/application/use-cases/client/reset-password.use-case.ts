import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CLIENT_REPOSITORY } from '../../../domain/interfaces/client.repository.interface.js';
import type { IClientRepository } from '../../../domain/interfaces/client.repository.interface.js';
import { HASH_SERVICE } from '../../../domain/interfaces/hash.service.interface.js';
import type { IHashService } from '../../../domain/interfaces/hash.service.interface.js';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import { ResetPasswordDto } from '../../../dto/reset-password.dto.js';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY) private clientRepository: IClientRepository,
    @Inject(HASH_SERVICE) private hashService: IHashService,
    @Inject(EMAIL_SERVICE) private emailService: IEmailService,
  ) {}

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const client = await this.clientRepository.findByEmail(dto.email);

    if (!client) {
      throw new BadRequestException('Invalid code or email');
    }

    const activeCodes = await this.clientRepository.findActiveVerificationCodes(
      client.id,
      'PASSWORD_CHANGE',
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
      throw new BadRequestException('Invalid or expired code');
    }

    const hashedPassword = await this.hashService.hash(dto.newPassword);

    await this.clientRepository.updatePassword(client.id, hashedPassword);
    await this.clientRepository.markVerificationCodeAsUsed(matchedCodeId);
    await this.clientRepository.deleteVerificationCodesByClientId(client.id, 'PASSWORD_CHANGE');

    void this.emailService.sendPasswordChangedEmail(dto.email, client.name);

    return { message: 'Password reset successfully' };
  }
}
