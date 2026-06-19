import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { randomInt } from 'node:crypto';
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IHashService } from '../../../../auth/domain/interfaces/hash.service.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import { VerificationChannel } from '../../../../auth/domain/constants/verification-channel.constant.js';
import { VerificationType } from '../../../../auth/domain/constants/verification-type.constant.js';
import type { IAdminProfileSelfRepository } from '../../../domain/interfaces/admin-profile.repository.interface.js';
import type { RequestAdminEmailChangeDto } from '../../../dto/profile/request-admin-email-change.dto.js';

@Injectable()
export class RequestAdminEmailChangeUseCase {
  constructor(
    @Inject(DiTokens.adminProfileSelfRepository)
    private adminRepository: IAdminProfileSelfRepository,
    @Inject(DiTokens.hashService) private hashService: IHashService,
    @Inject(DiTokens.emailService) private emailService: IEmailService,
  ) {}

  async requestEmailChange(adminId: number, dto: RequestAdminEmailChangeDto) {
    const admin = await this.adminRepository.findAdminById(adminId);

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const existing = await this.adminRepository.findByEmail(dto.newEmail);

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const code = randomInt(100000, 1000000).toString();
    const hashedCode = await this.hashService.hash(code);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.adminRepository.deleteVerificationCodesByAdminId(
      adminId,
      VerificationType.emailChange,
    );

    await this.adminRepository.createVerificationCode(
      adminId,
      hashedCode,
      VerificationType.emailChange,
      VerificationChannel.email,
      expiresAt,
    );

    void this.emailService.sendEmailChangeVerification(dto.newEmail, admin.name, code);

    return { message: 'Verification code sent to the new email' };
  }
}
