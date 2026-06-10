import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { ApproveClientUseCase } from './approve-client.use-case.js';

describe('ApproveClientUseCase', () => {
  let useCase: ApproveClientUseCase;
  let clientMgmtRepository: { findClientById: Mock; approveClientById: Mock };
  let emailService: { sendClientApprovedEmail: Mock };

  beforeEach(async () => {
    clientMgmtRepository = {
      findClientById: vi.fn(),
      approveClientById: vi.fn(),
    };
    emailService = {
      sendClientApprovedEmail: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApproveClientUseCase,
        { provide: DiTokens.clientManagementRepository, useValue: clientMgmtRepository },
        { provide: DiTokens.emailService, useValue: emailService },
      ],
    }).compile();

    useCase = module.get<ApproveClientUseCase>(ApproveClientUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should approve a PENDING client and send email', async () => {
    const client = { id: 1, name: 'João', email: 'joao@example.com', status: 'PENDING' };

    clientMgmtRepository.findClientById.mockResolvedValue(client);
    clientMgmtRepository.approveClientById.mockResolvedValue(undefined);

    await useCase.approveClientById(1);

    expect(clientMgmtRepository.findClientById).toHaveBeenCalledWith(1);
    expect(clientMgmtRepository.approveClientById).toHaveBeenCalledWith(1);
    expect(emailService.sendClientApprovedEmail).toHaveBeenCalledWith('joao@example.com', 'João');
  });

  it('should throw NotFoundException when client not found', async () => {
    clientMgmtRepository.findClientById.mockResolvedValue(null);

    await expect(useCase.approveClientById(999)).rejects.toThrow(NotFoundException);
    expect(clientMgmtRepository.approveClientById).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when client is ACTIVE', async () => {
    const client = { id: 1, name: 'João', status: 'ACTIVE' };
    clientMgmtRepository.findClientById.mockResolvedValue(client);

    await expect(useCase.approveClientById(1)).rejects.toThrow(BadRequestException);
    expect(clientMgmtRepository.approveClientById).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when client is INACTIVE', async () => {
    const client = { id: 1, name: 'João', status: 'INACTIVE' };
    clientMgmtRepository.findClientById.mockResolvedValue(client);

    await expect(useCase.approveClientById(1)).rejects.toThrow(BadRequestException);
    expect(clientMgmtRepository.approveClientById).not.toHaveBeenCalled();
  });
});
