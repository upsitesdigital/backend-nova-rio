import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IHashService } from '../../../../auth/domain/interfaces/hash.service.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import { VerificationType } from '../../../../auth/domain/constants/verification-type.constant.js';
import type { IAdminProfileSelfRepository } from '../../../domain/interfaces/admin-profile.repository.interface.js';
import type { VerifyAdminPasswordChangeDto } from '../../../dto/profile/verify-admin-password-change.dto.js';

@Injectable()
export class VerifyAdminPasswordChangeUseCase {
  constructor(
    @Inject(DiTokens.adminProfileSelfRepository)
    private adminRepository: IAdminProfileSelfRepository,
    @Inject(DiTokens.hashService) private hashService: IHashService,
    @Inject(DiTokens.emailService) private emailService: IEmailService,
  ) {}

  async verifyPasswordChange(adminId: number, dto: VerifyAdminPasswordChangeDto) {
    const admin = await this.adminRepository.findAdminById(adminId);

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const codes = await this.adminRepository.findActiveVerificationCodes(
      adminId,
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

    const consumed = await this.adminRepository.markVerificationCodeAsUsed(matchedCodeId);
    if (consumed === false) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.adminRepository.updatePassword(adminId, hashedPassword);

    void this.emailService.sendPasswordChangedEmail(admin.email, admin.name);

    return { message: 'Password updated successfully' };
  }
}
