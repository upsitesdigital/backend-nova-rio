import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { ResetPasswordUseCase } from './reset-password.use-case.js';

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let clientRepository: {
    findByEmail: Mock;
    findActiveVerificationCodes: Mock;
    completePasswordReset: Mock;
    deleteVerificationCodesByClientId: Mock;
    reserveResetAttempt: Mock;
    getResetAttempts: Mock;
    incrementResetAttempts: Mock;
    clearResetAttempts: Mock;
  };
  let hashService: { compare: Mock; hash: Mock };
  let emailService: { sendPasswordChangedEmail: Mock };

  const validDto = {
    email: 'test@example.com',
    code: '123456',
    newPassword: 'NewPass@2026!',
  };

  const client = { id: 1, name: 'Test User', email: 'test@example.com', status: 'ACTIVE' };

  beforeEach(async () => {
    clientRepository = {
      findByEmail: vi.fn(),
      findActiveVerificationCodes: vi.fn(),
      completePasswordReset: vi.fn(),
      deleteVerificationCodesByClientId: vi.fn(),
      reserveResetAttempt: vi.fn().mockResolvedValue({ allowed: true, failedResetAttempts: 1 }),
      getResetAttempts: vi
        .fn()
        .mockResolvedValue({ failedResetAttempts: 0, resetLockedUntil: null }),
      incrementResetAttempts: vi.fn().mockResolvedValue(undefined),
      clearResetAttempts: vi.fn().mockResolvedValue(undefined),
    };
    hashService = {
      compare: vi.fn(),
      hash: vi.fn().mockResolvedValue('hashedPassword'),
    };
    emailService = {
      sendPasswordChangedEmail: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetPasswordUseCase,
        { provide: DiTokens.clientVerificationRepository, useValue: clientRepository },
        { provide: DiTokens.hashService, useValue: hashService },
        { provide: DiTokens.emailService, useValue: emailService },
      ],
    }).compile();

    useCase = module.get<ResetPasswordUseCase>(ResetPasswordUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should reset password with valid code', async () => {
    clientRepository.findByEmail.mockResolvedValue(client);
    clientRepository.findActiveVerificationCodes.mockResolvedValue([
      { id: 10, code: 'hashedCode', expiresAt: new Date(Date.now() + 60000) },
    ]);
    hashService.compare.mockResolvedValue(true);
    clientRepository.completePasswordReset.mockResolvedValue(true);

    const result = await useCase.resetPassword(validDto);

    expect(result).toEqual({ message: 'Password reset successfully' });
    expect(clientRepository.completePasswordReset).toHaveBeenCalledWith(1, 10, 'hashedPassword');
    expect(clientRepository.clearResetAttempts).toHaveBeenCalledWith(1);
  });

  it('should throw BadRequestException for invalid email', async () => {
    clientRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.resetPassword(validDto)).rejects.toThrow(BadRequestException);
    await expect(useCase.resetPassword(validDto)).rejects.toThrow('Invalid or expired code');
  });

  it('should throw BadRequestException when no active codes exist', async () => {
    clientRepository.findByEmail.mockResolvedValue(client);
    clientRepository.findActiveVerificationCodes.mockResolvedValue([]);

    await expect(useCase.resetPassword(validDto)).rejects.toThrow(BadRequestException);
    expect(clientRepository.reserveResetAttempt).toHaveBeenCalledWith(1);
    expect(clientRepository.incrementResetAttempts).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException for wrong code', async () => {
    clientRepository.findByEmail.mockResolvedValue(client);
    clientRepository.findActiveVerificationCodes.mockResolvedValue([
      { id: 10, code: 'hashedCode', expiresAt: new Date(Date.now() + 60000) },
    ]);
    hashService.compare.mockResolvedValue(false);

    await expect(useCase.resetPassword(validDto)).rejects.toThrow(BadRequestException);
    expect(clientRepository.reserveResetAttempt).toHaveBeenCalledWith(1);
    expect(clientRepository.incrementResetAttempts).not.toHaveBeenCalled();
  });

  it('should reject when the atomic reset-attempt reservation is denied', async () => {
    clientRepository.findByEmail.mockResolvedValue(client);
    clientRepository.reserveResetAttempt.mockResolvedValue({
      allowed: false,
      failedResetAttempts: 5,
    });

    await expect(useCase.resetPassword(validDto)).rejects.toThrow('Invalid or expired code');
    expect(clientRepository.findActiveVerificationCodes).not.toHaveBeenCalled();
  });

  it('should delete codes when reserved attempt reaches threshold', async () => {
    clientRepository.findByEmail.mockResolvedValue(client);
    clientRepository.findActiveVerificationCodes.mockResolvedValue([
      { id: 10, code: 'hashedCode', expiresAt: new Date(Date.now() + 60000) },
    ]);
    hashService.compare.mockResolvedValue(false);
    clientRepository.reserveResetAttempt.mockResolvedValue({
      allowed: true,
      failedResetAttempts: 5,
    });

    await expect(useCase.resetPassword(validDto)).rejects.toThrow(BadRequestException);

    expect(clientRepository.deleteVerificationCodesByClientId).toHaveBeenCalledWith(
      1,
      'PASSWORD_CHANGE',
    );
  });

  it('should send password changed email on success', async () => {
    clientRepository.findByEmail.mockResolvedValue(client);
    clientRepository.findActiveVerificationCodes.mockResolvedValue([
      { id: 10, code: 'hashedCode', expiresAt: new Date(Date.now() + 60000) },
    ]);
    hashService.compare.mockResolvedValue(true);
    clientRepository.completePasswordReset.mockResolvedValue(true);

    await useCase.resetPassword(validDto);

    expect(emailService.sendPasswordChangedEmail).toHaveBeenCalledWith(
      'test@example.com',
      'Test User',
    );
  });

  it('should rely on reserveResetAttempt to clear expired lockout windows', async () => {
    clientRepository.findByEmail.mockResolvedValue(client);
    clientRepository.reserveResetAttempt.mockResolvedValue({
      allowed: true,
      failedResetAttempts: 1,
    });
    clientRepository.findActiveVerificationCodes.mockResolvedValue([
      { id: 10, code: 'hashedCode', expiresAt: new Date(Date.now() + 60000) },
    ]);
    hashService.compare.mockResolvedValue(true);
    clientRepository.completePasswordReset.mockResolvedValue(true);

    const result = await useCase.resetPassword(validDto);

    expect(result).toEqual({ message: 'Password reset successfully' });
    expect(clientRepository.clearResetAttempts).toHaveBeenCalledWith(1);
  });
});
