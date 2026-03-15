import { type Mock, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CLIENT_VERIFICATION_REPOSITORY } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import { HASH_SERVICE } from '../../../../auth/domain/interfaces/hash.service.interface.js';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import { RequestPasswordChangeUseCase } from './request-password-change.use-case.js';

describe('RequestPasswordChangeUseCase', () => {
  let useCase: RequestPasswordChangeUseCase;
  let clientRepository: {
    findById: Mock;
    deleteVerificationCodesByClientId: Mock;
    createVerificationCode: Mock;
  };
  let hashService: { hash: Mock };
  let emailService: { sendPasswordResetCode: Mock };

  beforeEach(async () => {
    clientRepository = {
      findById: vi.fn(),
      deleteVerificationCodesByClientId: vi.fn(),
      createVerificationCode: vi.fn(),
    };
    hashService = { hash: vi.fn().mockResolvedValue('hashedCode') };
    emailService = { sendPasswordResetCode: vi.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestPasswordChangeUseCase,
        { provide: CLIENT_VERIFICATION_REPOSITORY, useValue: clientRepository },
        { provide: HASH_SERVICE, useValue: hashService },
        { provide: EMAIL_SERVICE, useValue: emailService },
      ],
    }).compile();

    useCase = module.get<RequestPasswordChangeUseCase>(RequestPasswordChangeUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should generate code, store it, and send email to current address', async () => {
    const client = { id: 1, name: 'Test', email: 'test@example.com' };
    clientRepository.findById.mockResolvedValue(client);

    const result = await useCase.requestPasswordChange(1);

    expect(result).toEqual({ message: 'Verification code sent to your email' });
    expect(clientRepository.deleteVerificationCodesByClientId).toHaveBeenCalledWith(
      1,
      'PASSWORD_CHANGE',
    );
    expect(hashService.hash).toHaveBeenCalledWith(expect.any(String));
    expect(clientRepository.createVerificationCode).toHaveBeenCalledWith(
      1,
      'hashedCode',
      'PASSWORD_CHANGE',
      'EMAIL',
      expect.any(Date),
    );
    expect(emailService.sendPasswordResetCode).toHaveBeenCalledWith(
      'test@example.com',
      'Test',
      expect.any(String),
    );
  });

  it('should throw NotFoundException when client not found', async () => {
    clientRepository.findById.mockResolvedValue(null);

    await expect(useCase.requestPasswordChange(999)).rejects.toThrow(NotFoundException);
  });
});
