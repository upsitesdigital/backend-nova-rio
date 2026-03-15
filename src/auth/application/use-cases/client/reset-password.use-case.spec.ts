import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { CLIENT_VERIFICATION_REPOSITORY } from '../../../domain/interfaces/client.repository.interface.js';
import { HASH_SERVICE } from '../../../domain/interfaces/hash.service.interface.js';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import { ResetPasswordUseCase } from './reset-password.use-case.js';

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let clientRepository: {
    findByEmail: Mock;
    findActiveVerificationCodes: Mock;
    completePasswordReset: Mock;
    deleteVerificationCodesByClientId: Mock;
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
        { provide: CLIENT_VERIFICATION_REPOSITORY, useValue: clientRepository },
        { provide: HASH_SERVICE, useValue: hashService },
        { provide: EMAIL_SERVICE, useValue: emailService },
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
    clientRepository.completePasswordReset.mockResolvedValue(undefined);

    const result = await useCase.resetPassword(validDto);

    expect(result).toEqual({ message: 'Password reset successfully' });
    expect(clientRepository.completePasswordReset).toHaveBeenCalledWith(1, 'hashedPassword', 10);
  });

  it('should throw BadRequestException for invalid email', async () => {
    clientRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.resetPassword(validDto)).rejects.toThrow(BadRequestException);
    await expect(useCase.resetPassword(validDto)).rejects.toThrow('Invalid code or email');
  });

  it('should throw BadRequestException when no active codes exist', async () => {
    clientRepository.findByEmail.mockResolvedValue(client);
    clientRepository.findActiveVerificationCodes.mockResolvedValue([]);

    await expect(useCase.resetPassword(validDto)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException for wrong code', async () => {
    clientRepository.findByEmail.mockResolvedValue(client);
    clientRepository.findActiveVerificationCodes.mockResolvedValue([
      { id: 10, code: 'hashedCode', expiresAt: new Date(Date.now() + 60000) },
    ]);
    hashService.compare.mockResolvedValue(false);

    await expect(useCase.resetPassword(validDto)).rejects.toThrow(BadRequestException);
  });

  it('should invalidate codes after 5 failed attempts (brute-force lockout)', async () => {
    clientRepository.findByEmail.mockResolvedValue(client);
    clientRepository.findActiveVerificationCodes.mockResolvedValue([
      { id: 10, code: 'hashedCode', expiresAt: new Date(Date.now() + 60000) },
    ]);
    hashService.compare.mockResolvedValue(false);

    for (let i = 0; i < 5; i++) {
      await expect(useCase.resetPassword(validDto)).rejects.toThrow(BadRequestException);
    }

    expect(clientRepository.deleteVerificationCodesByClientId).toHaveBeenCalledWith(
      client.id,
      'PASSWORD_CHANGE',
    );

    await expect(useCase.resetPassword(validDto)).rejects.toThrow(
      'Too many failed attempts. Please request a new code.',
    );
  });

  it('should send password changed email on success', async () => {
    clientRepository.findByEmail.mockResolvedValue(client);
    clientRepository.findActiveVerificationCodes.mockResolvedValue([
      { id: 10, code: 'hashedCode', expiresAt: new Date(Date.now() + 60000) },
    ]);
    hashService.compare.mockResolvedValue(true);
    clientRepository.completePasswordReset.mockResolvedValue(undefined);

    await useCase.resetPassword(validDto);

    expect(emailService.sendPasswordChangedEmail).toHaveBeenCalledWith(
      'test@example.com',
      'Test User',
    );
  });
});
