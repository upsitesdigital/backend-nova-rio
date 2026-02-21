import { type Mock, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { CLIENT_REPOSITORY } from '../../../domain/interfaces/client.repository.interface.js';
import { HASH_SERVICE } from '../../../domain/interfaces/hash.service.interface.js';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import { ForgotPasswordUseCase } from './forgot-password.use-case.js';

describe('ForgotPasswordUseCase', () => {
  let useCase: ForgotPasswordUseCase;
  let clientRepository: {
    findByEmail: Mock;
    createVerificationCode: Mock;
    deleteVerificationCodesByClientId: Mock;
  };
  let hashService: { hash: Mock };
  let emailService: { sendPasswordResetCode: Mock };

  beforeEach(async () => {
    clientRepository = {
      findByEmail: vi.fn(),
      createVerificationCode: vi.fn(),
      deleteVerificationCodesByClientId: vi.fn(),
    };
    hashService = {
      hash: vi.fn().mockResolvedValue('hashedCode'),
    };
    emailService = {
      sendPasswordResetCode: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForgotPasswordUseCase,
        { provide: CLIENT_REPOSITORY, useValue: clientRepository },
        { provide: HASH_SERVICE, useValue: hashService },
        { provide: EMAIL_SERVICE, useValue: emailService },
      ],
    }).compile();

    useCase = module.get<ForgotPasswordUseCase>(ForgotPasswordUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return success message even if client not found (for security)', async () => {
    clientRepository.findByEmail.mockResolvedValue(null);

    const result = await useCase.requestPasswordReset({ email: 'test@example.com' });

    expect(result).toEqual({
      message: 'If the email exists, a verification code was sent',
    });
    expect(clientRepository.createVerificationCode).not.toHaveBeenCalled();
    expect(emailService.sendPasswordResetCode).not.toHaveBeenCalled();
  });

  it('should hash verification code, store it, and send plaintext via email', async () => {
    const client = { id: 1, name: 'Test', email: 'test@example.com' };
    clientRepository.findByEmail.mockResolvedValue(client);

    const result = await useCase.requestPasswordReset({ email: 'test@example.com' });

    expect(result).toEqual({
      message: 'If the email exists, a verification code was sent',
    });
    expect(clientRepository.deleteVerificationCodesByClientId).toHaveBeenCalledWith(
      client.id,
      'PASSWORD_CHANGE',
    );
    expect(hashService.hash).toHaveBeenCalledWith(expect.any(String));
    expect(clientRepository.createVerificationCode).toHaveBeenCalledWith(
      client.id,
      'hashedCode',
      'PASSWORD_CHANGE',
      'EMAIL',
      expect.any(Date),
    );

    const deleteOrder =
      clientRepository.deleteVerificationCodesByClientId.mock.invocationCallOrder[0];
    const createOrder = clientRepository.createVerificationCode.mock.invocationCallOrder[0];
    expect(deleteOrder).toBeLessThan(createOrder);

    expect(emailService.sendPasswordResetCode).toHaveBeenCalledWith(
      'test@example.com',
      'Test',
      expect.any(String),
    );
  });
});
