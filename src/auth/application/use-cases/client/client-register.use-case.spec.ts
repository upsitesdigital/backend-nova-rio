import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { type Mock, vi } from 'vitest';
import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailAlreadyInUseError } from '../../../domain/errors/email-already-in-use.error.js';
import { ClientRegisterUseCase } from './client-register.use-case.js';

describe('ClientRegisterUseCase', () => {
  let useCase: ClientRegisterUseCase;
  let clientRepository: {
    findByEmail: Mock;
    create: Mock;
  };
  let emailService: { sendWelcomeEmail: Mock };
  let hashService: { hash: Mock };

  beforeEach(async () => {
    clientRepository = {
      findByEmail: vi.fn(),
      create: vi.fn(),
    };
    emailService = {
      sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
    };
    hashService = {
      hash: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientRegisterUseCase,
        { provide: DiTokens.clientAuthRepository, useValue: clientRepository },
        { provide: DiTokens.emailService, useValue: emailService },
        { provide: DiTokens.hashService, useValue: hashService },
      ],
    }).compile();

    useCase = module.get<ClientRegisterUseCase>(ClientRegisterUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw ConflictException if email is already registered', async () => {
    clientRepository.findByEmail.mockResolvedValue({ id: 1, email: 'test@example.com' });

    await expect(
      useCase.registerClient({
        name: 'Test',
        email: 'test@example.com',
        password: 'password',
        phone: '123456789',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should create client and return pending message on success', async () => {
    const dto = {
      name: 'Test',
      email: 'test@example.com',
      password: 'password',
      phone: '123456789',
    };
    const client = { id: 1, email: dto.email };

    clientRepository.findByEmail.mockResolvedValue(null);
    hashService.hash.mockResolvedValue('hashed_password');
    clientRepository.create.mockResolvedValue(client);

    const result = await useCase.registerClient(dto);

    expect(result).toEqual({
      message: 'Registration successful. Your account is pending approval.',
    });
    expect(hashService.hash).toHaveBeenCalledWith(dto.password);
    expect(clientRepository.create).toHaveBeenCalledWith({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      password: 'hashed_password',
    });
    expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(dto.email, dto.name);
  });

  it('should throw ConflictException when repository signals email already in use', async () => {
    const dto = {
      name: 'Test',
      email: 'test@example.com',
      password: 'password',
      phone: '123456789',
    };

    clientRepository.findByEmail.mockResolvedValue(null);
    hashService.hash.mockResolvedValue('hashed_password');

    clientRepository.create.mockRejectedValue(new EmailAlreadyInUseError());

    await expect(useCase.registerClient(dto)).rejects.toThrow(ConflictException);
  });

  it('should rethrow non-P2002 errors from create', async () => {
    const dto = {
      name: 'Test',
      email: 'test@example.com',
      password: 'password',
      phone: '123456789',
    };

    clientRepository.findByEmail.mockResolvedValue(null);
    hashService.hash.mockResolvedValue('hashed_password');

    const genericError = new Error('Database connection lost');
    clientRepository.create.mockRejectedValue(genericError);

    await expect(useCase.registerClient(dto)).rejects.toThrow('Database connection lost');
  });
});
