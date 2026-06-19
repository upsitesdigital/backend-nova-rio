import { DiTokens } from '../../../../shared/di/di-tokens.js';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IHashService } from '../../../../auth/domain/interfaces/hash.service.interface.js';
import type { IEmailService } from '../../../../email/domain/interfaces/email.service.interface.js';
import { VerificationType } from '../../../../auth/domain/constants/verification-type.constant.js';
import type { IAdminProfileSelfRepository } from '../../../domain/interfaces/admin-profile.repository.interface.js';
import type { VerifyAdminEmailChangeDto } from '../../../dto/profile/verify-admin-email-change.dto.js';

@Injectable()
export class VerifyAdminEmailChangeUseCase {
  constructor(
    @Inject(DiTokens.adminProfileSelfRepository)
    private adminRepository: IAdminProfileSelfRepository,
    @Inject(DiTokens.hashService) private hashService: IHashService,
    @Inject(DiTokens.emailService) private emailService: IEmailService,
  ) {}

  async verifyEmailChange(adminId: number, dto: VerifyAdminEmailChangeDto) {
    const admin = await this.adminRepository.findAdminById(adminId);

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const existing = await this.adminRepository.findByEmail(dto.newEmail);

    if (existing && existing.id !== adminId) {
      throw new ConflictException('Email already in use');
    }

    const codes = await this.adminRepository.findActiveVerificationCodes(
      adminId,
      VerificationType.emailChange,
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

    const consumed = await this.adminRepository.markVerificationCodeAsUsed(matchedCodeId);
    if (consumed === false) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.adminRepository.updateEmail(adminId, dto.newEmail);

    void this.emailService.sendEmailChangedEmail(admin.email, admin.name, dto.newEmail);

    return { message: 'Email updated successfully' };
  }
}
