import { type Mock, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CLIENT_VERIFICATION_REPOSITORY } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import { HASH_SERVICE } from '../../../../auth/domain/interfaces/hash.service.interface.js';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import { RequestEmailChangeUseCase } from './request-email-change.use-case.js';

describe('RequestEmailChangeUseCase', () => {
  let useCase: RequestEmailChangeUseCase;
  let clientRepository: {
    findById: Mock;
    findByEmail: Mock;
    deleteVerificationCodesByClientId: Mock;
    createVerificationCode: Mock;
  };
  let hashService: { hash: Mock };
  let emailService: { sendEmailChangeVerification: Mock };

  beforeEach(async () => {
    clientRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      deleteVerificationCodesByClientId: vi.fn(),
      createVerificationCode: vi.fn(),
    };
    hashService = { hash: vi.fn().mockResolvedValue('hashedCode') };
    emailService = { sendEmailChangeVerification: vi.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestEmailChangeUseCase,
        { provide: CLIENT_VERIFICATION_REPOSITORY, useValue: clientRepository },
        { provide: HASH_SERVICE, useValue: hashService },
        { provide: EMAIL_SERVICE, useValue: emailService },
      ],
    }).compile();

    useCase = module.get<RequestEmailChangeUseCase>(RequestEmailChangeUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should generate code, store it, and send email to new address', async () => {
    const client = { id: 1, name: 'Test', email: 'old@example.com' };
    clientRepository.findById.mockResolvedValue(client);
    clientRepository.findByEmail.mockResolvedValue(null);

    const result = await useCase.requestEmailChange(1, { newEmail: 'new@example.com' });

    expect(result).toEqual({ message: 'Verification code sent to the new email' });
    expect(clientRepository.deleteVerificationCodesByClientId).toHaveBeenCalledWith(
      1,
      'EMAIL_CHANGE',
    );
    expect(hashService.hash).toHaveBeenCalledWith(expect.any(String));
    expect(clientRepository.createVerificationCode).toHaveBeenCalledWith(
      1,
      'hashedCode',
      'EMAIL_CHANGE',
      'EMAIL',
      expect.any(Date),
    );
    expect(emailService.sendEmailChangeVerification).toHaveBeenCalledWith(
      'new@example.com',
      'Test',
      expect.any(String),
    );
  });

  it('should throw NotFoundException when client not found', async () => {
    clientRepository.findById.mockResolvedValue(null);

    await expect(useCase.requestEmailChange(999, { newEmail: 'new@example.com' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw ConflictException when email already in use', async () => {
    const client = { id: 1, name: 'Test', email: 'old@example.com' };
    clientRepository.findById.mockResolvedValue(client);
    clientRepository.findByEmail.mockResolvedValue({ id: 2, email: 'new@example.com' });

    await expect(useCase.requestEmailChange(1, { newEmail: 'new@example.com' })).rejects.toThrow(
      ConflictException,
    );
  });
});
