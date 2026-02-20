import { type Mock, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { CLIENT_REPOSITORY } from '../../../domain/interfaces/client.repository.interface.js';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import { ForgotPasswordUseCase } from './forgot-password.use-case.js';

describe('ForgotPasswordUseCase', () => {
  let useCase: ForgotPasswordUseCase;
  let clientRepository: { findByEmail: Mock; createVerificationCode: Mock };
  let emailService: { sendPasswordResetCode: Mock };

  beforeEach(async () => {
    clientRepository = {
      findByEmail: vi.fn(),
      createVerificationCode: vi.fn(),
    };
    emailService = {
      sendPasswordResetCode: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForgotPasswordUseCase,
        { provide: CLIENT_REPOSITORY, useValue: clientRepository },
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

    const result = await useCase.execute({ email: 'test@example.com' });

    expect(result).toEqual({
      message: 'If the email exists, a verification code was sent',
    });
    expect(clientRepository.createVerificationCode).not.toHaveBeenCalled();
    expect(emailService.sendPasswordResetCode).not.toHaveBeenCalled();
  });

  it('should create verification code and send email if client exists', async () => {
    const client = { id: 1, name: 'Test', email: 'test@example.com' };
    clientRepository.findByEmail.mockResolvedValue(client);

    const result = await useCase.execute({ email: 'test@example.com' });

    expect(result).toEqual({
      message: 'If the email exists, a verification code was sent',
    });
    expect(clientRepository.createVerificationCode).toHaveBeenCalledWith(
      client.id,
      expect.any(String),
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
});
