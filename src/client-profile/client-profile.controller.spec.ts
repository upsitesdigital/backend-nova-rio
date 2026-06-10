import { DiTokens } from '../shared/di/di-tokens.js';
import { type Mock, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ClientProfileController } from './client-profile.controller.js';
import { GetClientProfileUseCase } from './application/use-cases/profile/get-client-profile.use-case.js';
import { UpdateClientProfileUseCase } from './application/use-cases/profile/update-client-profile.use-case.js';
import { RequestEmailChangeUseCase } from './application/use-cases/profile/request-email-change.use-case.js';
import { VerifyEmailChangeUseCase } from './application/use-cases/profile/verify-email-change.use-case.js';
import { RequestPasswordChangeUseCase } from './application/use-cases/profile/request-password-change.use-case.js';
import { VerifyPasswordChangeUseCase } from './application/use-cases/profile/verify-password-change.use-case.js';
import { DeleteClientAccountUseCase } from './application/use-cases/profile/delete-client-account.use-case.js';
import type { AuthUser } from '../shared/types/auth-user.type.js';

describe('ClientProfileController', () => {
  let controller: ClientProfileController;
  let getClientProfileUseCase: { getClientProfile: Mock };
  let updateClientProfileUseCase: { updateClientProfile: Mock };
  let requestEmailChangeUseCase: { requestEmailChange: Mock };
  let verifyEmailChangeUseCase: { verifyEmailChange: Mock };
  let requestPasswordChangeUseCase: { requestPasswordChange: Mock };
  let verifyPasswordChangeUseCase: { verifyPasswordChange: Mock };
  let deleteClientAccountUseCase: { deleteClientAccount: Mock };

  const mockUser: AuthUser = { id: 1, email: 'test@example.com', type: 'client' };

  beforeEach(async () => {
    getClientProfileUseCase = { getClientProfile: vi.fn() };
    updateClientProfileUseCase = { updateClientProfile: vi.fn() };
    requestEmailChangeUseCase = { requestEmailChange: vi.fn() };
    verifyEmailChangeUseCase = { verifyEmailChange: vi.fn() };
    requestPasswordChangeUseCase = { requestPasswordChange: vi.fn() };
    verifyPasswordChangeUseCase = { verifyPasswordChange: vi.fn() };
    deleteClientAccountUseCase = { deleteClientAccount: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientProfileController],
      providers: [
        { provide: GetClientProfileUseCase, useValue: getClientProfileUseCase },
        { provide: UpdateClientProfileUseCase, useValue: updateClientProfileUseCase },
        { provide: RequestEmailChangeUseCase, useValue: requestEmailChangeUseCase },
        { provide: VerifyEmailChangeUseCase, useValue: verifyEmailChangeUseCase },
        { provide: RequestPasswordChangeUseCase, useValue: requestPasswordChangeUseCase },
        { provide: VerifyPasswordChangeUseCase, useValue: verifyPasswordChangeUseCase },
        { provide: DeleteClientAccountUseCase, useValue: deleteClientAccountUseCase },
        { provide: DiTokens.clientAuthRepository, useValue: { findById: vi.fn() } },
      ],
    }).compile();

    controller = module.get<ClientProfileController>(ClientProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getClientProfile with user id', async () => {
    await controller.getProfile(mockUser);
    expect(getClientProfileUseCase.getClientProfile).toHaveBeenCalledWith(1);
  });

  it('should call updateClientProfile with user id and dto', async () => {
    const dto = { name: 'Updated' };
    await controller.updateProfile(mockUser, dto);
    expect(updateClientProfileUseCase.updateClientProfile).toHaveBeenCalledWith(1, dto);
  });

  it('should call requestEmailChange with user id and dto', async () => {
    const dto = { newEmail: 'new@example.com' };
    await controller.requestEmailChange(mockUser, dto);
    expect(requestEmailChangeUseCase.requestEmailChange).toHaveBeenCalledWith(1, dto);
  });

  it('should call verifyEmailChange with user id and dto', async () => {
    const dto = { code: '123456', newEmail: 'new@example.com' };
    await controller.verifyEmailChange(mockUser, dto);
    expect(verifyEmailChangeUseCase.verifyEmailChange).toHaveBeenCalledWith(1, dto);
  });

  it('should call requestPasswordChange with user id', async () => {
    await controller.requestPasswordChange(mockUser);
    expect(requestPasswordChangeUseCase.requestPasswordChange).toHaveBeenCalledWith(1);
  });

  it('should call verifyPasswordChange with user id and dto', async () => {
    const dto = { code: '123456', newPassword: 'NewPass@2026!' };
    await controller.verifyPasswordChange(mockUser, dto);
    expect(verifyPasswordChangeUseCase.verifyPasswordChange).toHaveBeenCalledWith(1, dto);
  });

  it('should call deleteClientAccount with user id', async () => {
    const dto = { confirmPhrase: 'Apagar minha conta' };
    await controller.deleteAccount(mockUser, dto);
    expect(deleteClientAccountUseCase.deleteClientAccount).toHaveBeenCalledWith(1);
  });
});
