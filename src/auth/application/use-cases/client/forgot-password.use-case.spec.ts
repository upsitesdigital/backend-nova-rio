import { type Mock, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { CLIENT_REPOSITORY } from '../../../domain/interfaces/client.repository.interface.js';
import { ForgotPasswordUseCase } from './forgot-password.use-case.js';

describe('ForgotPasswordUseCase', () => {
  let useCase: ForgotPasswordUseCase;
  let clientRepository: { findByEmail: Mock; createVerificationCode: Mock };

  beforeEach(async () => {
    clientRepository = {
      findByEmail: vi.fn(),
      createVerificationCode: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForgotPasswordUseCase,
        { provide: CLIENT_REPOSITORY, useValue: clientRepository },
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
  });

  it('should create verification code if client exists', async () => {
    const client = { id: 1, email: 'test@example.com' };
    clientRepository.findByEmail.mockResolvedValue(client);

    const result = await useCase.execute({ email: 'test@example.com' });

    expect(result).toEqual({
      message: 'If the email exists, a verification code was sent',
    });
    expect(clientRepository.createVerificationCode).toHaveBeenCalledWith(
      client.id,
      expect.any(String),
      'PASSWORD_CHANGE',
      'SMS',
      expect.any(Date),
    );
  });
});
