import { type Mock, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import type { AuthUser } from '../shared/types/auth-user.type.js';
import { AuthController } from './auth.controller.js';
import { AdminLoginUseCase } from './application/use-cases/admin/admin-login.use-case.js';
import { ClientLoginUseCase } from './application/use-cases/client/client-login.use-case.js';
import { ClientRegisterUseCase } from './application/use-cases/client/client-register.use-case.js';
import { ForgotPasswordUseCase } from './application/use-cases/client/forgot-password.use-case.js';
import { GetProfileUseCase } from './application/use-cases/auth/get-profile.use-case.js';
import { RefreshTokenUseCase } from './application/use-cases/auth/refresh-token.use-case.js';

describe('AuthController', () => {
  let controller: AuthController;
  let clientRegisterUseCase: { registerClient: Mock };
  let clientLoginUseCase: { loginClient: Mock };
  let adminLoginUseCase: { loginAdmin: Mock };
  let refreshTokenUseCase: { refreshTokens: Mock };
  let forgotPasswordUseCase: { requestPasswordReset: Mock };
  let getProfileUseCase: { getProfile: Mock };

  beforeEach(async () => {
    clientRegisterUseCase = { registerClient: vi.fn() };
    clientLoginUseCase = { loginClient: vi.fn() };
    adminLoginUseCase = { loginAdmin: vi.fn() };
    refreshTokenUseCase = { refreshTokens: vi.fn() };
    forgotPasswordUseCase = { requestPasswordReset: vi.fn() };
    getProfileUseCase = { getProfile: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: ClientRegisterUseCase, useValue: clientRegisterUseCase },
        { provide: ClientLoginUseCase, useValue: clientLoginUseCase },
        { provide: AdminLoginUseCase, useValue: adminLoginUseCase },
        { provide: RefreshTokenUseCase, useValue: refreshTokenUseCase },
        { provide: ForgotPasswordUseCase, useValue: forgotPasswordUseCase },
        { provide: GetProfileUseCase, useValue: getProfileUseCase },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('clientRegister should call clientRegisterUseCase', async () => {
    const dto = { name: 'Test', email: 'test@test.com', password: 'pass', phone: '123' };
    await controller.clientRegister(dto);
    expect(clientRegisterUseCase.registerClient).toHaveBeenCalledWith(dto);
  });

  it('clientLogin should call clientLoginUseCase', async () => {
    const dto = { email: 'test@test.com', password: 'pass' };
    await controller.clientLogin(dto);
    expect(clientLoginUseCase.loginClient).toHaveBeenCalledWith(dto);
  });

  it('adminLogin should call adminLoginUseCase', async () => {
    const dto = { email: 'admin@test.com', password: 'pass' };
    await controller.adminLogin(dto);
    expect(adminLoginUseCase.loginAdmin).toHaveBeenCalledWith(dto);
  });

  it('refreshToken should call refreshTokenUseCase', async () => {
    const dto = { refreshToken: 'token' };
    await controller.refreshToken(dto);
    expect(refreshTokenUseCase.refreshTokens).toHaveBeenCalledWith(dto);
  });

  it('forgotPassword should call forgotPasswordUseCase', async () => {
    const dto = { email: 'test@test.com' };
    await controller.forgotPassword(dto);
    expect(forgotPasswordUseCase.requestPasswordReset).toHaveBeenCalledWith(dto);
  });

  it('getProfile should call getProfileUseCase', async () => {
    const user: AuthUser = { id: 1, type: 'client', email: 'test@test.com' };
    await controller.getProfile(user);
    expect(getProfileUseCase.getProfile).toHaveBeenCalledWith(user);
  });
});
