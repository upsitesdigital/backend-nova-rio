import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { type Mock, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteClientAccountUseCase } from './delete-client-account.use-case.js';

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
        { provide: DiTokens.clientProfileRepository, useValue: clientRepository },
        { provide: DiTokens.emailService, useValue: emailService },
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

    const result = await useCase.deleteClientAccount(1);

    expect(result).toEqual({ message: 'Account deleted successfully' });
    expect(clientRepository.deactivateClient).toHaveBeenCalledWith(1);
    expect(emailService.sendAccountDeletedEmail).toHaveBeenCalledWith('test@example.com', 'Test');
  });

  it('should throw NotFoundException when client not found', async () => {
    clientRepository.findById.mockResolvedValue(null);

    await expect(useCase.deleteClientAccount(999)).rejects.toThrow(NotFoundException);
  });
});
