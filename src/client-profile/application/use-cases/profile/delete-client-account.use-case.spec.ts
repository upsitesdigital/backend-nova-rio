import { type Mock, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CLIENT_REPOSITORY } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import { EMAIL_SERVICE } from '../../../../email/domain/interfaces/email.service.interface.js';
import { DeleteClientAccountUseCase } from './delete-client-account.use-case.js';

const validDto = { confirmPhrase: 'Apagar minha conta' };

describe('DeleteClientAccountUseCase', () => {
  let useCase: DeleteClientAccountUseCase;
  let clientRepository: { findById: Mock; deactivateClient: Mock };
  let emailService: { sendAccountDeletedEmail: Mock };

  beforeEach(async () => {
    clientRepository = {
      findById: vi.fn(),
      deactivateClient: vi.fn(),
    };
    emailService = { sendAccountDeletedEmail: vi.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteClientAccountUseCase,
        { provide: CLIENT_REPOSITORY, useValue: clientRepository },
        { provide: EMAIL_SERVICE, useValue: emailService },
      ],
    }).compile();

    useCase = module.get<DeleteClientAccountUseCase>(DeleteClientAccountUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should deactivate client and send email', async () => {
    const client = { id: 1, name: 'Test', email: 'test@example.com' };
    clientRepository.findById.mockResolvedValue(client);

    const result = await useCase.deleteClientAccount(1, validDto);

    expect(result).toEqual({ message: 'Account deleted successfully' });
    expect(clientRepository.deactivateClient).toHaveBeenCalledWith(1);
    expect(emailService.sendAccountDeletedEmail).toHaveBeenCalledWith('test@example.com', 'Test');
  });

  it('should throw BadRequestException when confirmation phrase is wrong', async () => {
    await expect(useCase.deleteClientAccount(1, { confirmPhrase: 'wrong phrase' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw NotFoundException when client not found', async () => {
    clientRepository.findById.mockResolvedValue(null);

    await expect(useCase.deleteClientAccount(999, validDto)).rejects.toThrow(NotFoundException);
  });
});
