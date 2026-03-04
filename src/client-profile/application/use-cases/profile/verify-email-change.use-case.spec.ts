import { type Mock, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { CLIENT_REPOSITORY } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import { HASH_SERVICE } from '../../../../auth/domain/interfaces/hash.service.interface.js';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import { VerifyEmailChangeUseCase } from './verify-email-change.use-case.js';

describe('VerifyEmailChangeUseCase', () => {
  let useCase: VerifyEmailChangeUseCase;
  let clientRepository: {
    findById: Mock;
    findByEmail: Mock;
    findActiveVerificationCodes: Mock;
    markVerificationCodeAsUsed: Mock;
    updateEmail: Mock;
  };
  let hashService: { compare: Mock };
  let emailService: { sendEmailChangedEmail: Mock };

  beforeEach(async () => {
    clientRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findActiveVerificationCodes: vi.fn(),
      markVerificationCodeAsUsed: vi.fn(),
      updateEmail: vi.fn(),
    };
    hashService = { compare: vi.fn() };
    emailService = { sendEmailChangedEmail: vi.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyEmailChangeUseCase,
        { provide: CLIENT_REPOSITORY, useValue: clientRepository },
        { provide: HASH_SERVICE, useValue: hashService },
        { provide: EMAIL_SERVICE, useValue: emailService },
      ],
    }).compile();

    useCase = module.get<VerifyEmailChangeUseCase>(VerifyEmailChangeUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should verify code and update email', async () => {
    const client = { id: 1, name: 'Test', email: 'old@example.com' };
    clientRepository.findById.mockResolvedValue(client);
    clientRepository.findByEmail.mockResolvedValue(null);
    clientRepository.findActiveVerificationCodes.mockResolvedValue([
      { id: 10, code: 'hashedCode', expiresAt: new Date(Date.now() + 60000) },
    ]);
    hashService.compare.mockResolvedValue(true);

    const result = await useCase.verifyEmailChange(1, {
      code: '123456',
      newEmail: 'new@example.com',
    });

    expect(result).toEqual({ message: 'Email updated successfully' });
    expect(clientRepository.markVerificationCodeAsUsed).toHaveBeenCalledWith(10);
    expect(clientRepository.updateEmail).toHaveBeenCalledWith(1, 'new@example.com');
    expect(emailService.sendEmailChangedEmail).toHaveBeenCalledWith(
      'old@example.com',
      'Test',
      'new@example.com',
    );
  });

  it('should throw NotFoundException when client not found', async () => {
    clientRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.verifyEmailChange(999, { code: '123456', newEmail: 'new@example.com' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException when email already taken', async () => {
    clientRepository.findById.mockResolvedValue({ id: 1, email: 'old@example.com' });
    clientRepository.findByEmail.mockResolvedValue({ id: 2, email: 'new@example.com' });

    await expect(
      useCase.verifyEmailChange(1, { code: '123456', newEmail: 'new@example.com' }),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw BadRequestException when no active codes', async () => {
    clientRepository.findById.mockResolvedValue({ id: 1, email: 'old@example.com' });
    clientRepository.findByEmail.mockResolvedValue(null);
    clientRepository.findActiveVerificationCodes.mockResolvedValue([]);

    await expect(
      useCase.verifyEmailChange(1, { code: '123456', newEmail: 'new@example.com' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when code does not match', async () => {
    clientRepository.findById.mockResolvedValue({ id: 1, email: 'old@example.com' });
    clientRepository.findByEmail.mockResolvedValue(null);
    clientRepository.findActiveVerificationCodes.mockResolvedValue([
      { id: 10, code: 'hashedCode', expiresAt: new Date(Date.now() + 60000) },
    ]);
    hashService.compare.mockResolvedValue(false);

    await expect(
      useCase.verifyEmailChange(1, { code: 'wrong', newEmail: 'new@example.com' }),
    ).rejects.toThrow(BadRequestException);
  });
});
