import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { type Mock, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VerifyPasswordChangeUseCase } from './verify-password-change.use-case.js';

describe('VerifyPasswordChangeUseCase', () => {
  let useCase: VerifyPasswordChangeUseCase;
  let clientRepository: {
    findById: Mock;
    findActiveVerificationCodes: Mock;
    markVerificationCodeAsUsed: Mock;
    updatePassword: Mock;
  };
  let hashService: { compare: Mock; hash: Mock };
  let emailService: { sendPasswordChangedEmail: Mock };

  beforeEach(async () => {
    clientRepository = {
      findById: vi.fn(),
      findActiveVerificationCodes: vi.fn(),
      markVerificationCodeAsUsed: vi.fn(),
      updatePassword: vi.fn(),
    };
    hashService = {
      compare: vi.fn(),
      hash: vi.fn().mockResolvedValue('hashedNewPassword'),
    };
    emailService = { sendPasswordChangedEmail: vi.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyPasswordChangeUseCase,
        { provide: DiTokens.clientVerificationRepository, useValue: clientRepository },
        { provide: DiTokens.hashService, useValue: hashService },
        { provide: DiTokens.emailService, useValue: emailService },
      ],
    }).compile();

    useCase = module.get<VerifyPasswordChangeUseCase>(VerifyPasswordChangeUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should verify code, hash new password, and update it', async () => {
    const client = { id: 1, name: 'Test', email: 'test@example.com' };
    clientRepository.findById.mockResolvedValue(client);
    clientRepository.findActiveVerificationCodes.mockResolvedValue([
      { id: 10, code: 'hashedCode', expiresAt: new Date(Date.now() + 60000) },
    ]);
    hashService.compare.mockResolvedValue(true);

    const result = await useCase.verifyPasswordChange(1, {
      code: '123456',
      newPassword: 'NewPass@2026!',
    });

    expect(result).toEqual({ message: 'Password updated successfully' });
    expect(hashService.hash).toHaveBeenCalledWith('NewPass@2026!');
    expect(clientRepository.markVerificationCodeAsUsed).toHaveBeenCalledWith(10);
    expect(clientRepository.updatePassword).toHaveBeenCalledWith(1, 'hashedNewPassword');
    expect(emailService.sendPasswordChangedEmail).toHaveBeenCalledWith('test@example.com', 'Test');
  });

  it('should throw NotFoundException when client not found', async () => {
    clientRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.verifyPasswordChange(999, { code: '123456', newPassword: 'NewPass@2026!' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when no active codes', async () => {
    clientRepository.findById.mockResolvedValue({ id: 1, email: 'test@example.com' });
    clientRepository.findActiveVerificationCodes.mockResolvedValue([]);

    await expect(
      useCase.verifyPasswordChange(1, { code: '123456', newPassword: 'NewPass@2026!' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when code does not match', async () => {
    clientRepository.findById.mockResolvedValue({ id: 1, email: 'test@example.com' });
    clientRepository.findActiveVerificationCodes.mockResolvedValue([
      { id: 10, code: 'hashedCode', expiresAt: new Date(Date.now() + 60000) },
    ]);
    hashService.compare.mockResolvedValue(false);

    await expect(
      useCase.verifyPasswordChange(1, { code: 'wrong', newPassword: 'NewPass@2026!' }),
    ).rejects.toThrow(BadRequestException);
  });
});
