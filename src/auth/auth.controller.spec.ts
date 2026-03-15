import { type Mock, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import type { AuthUser } from '../shared/types/auth-user.type.js';
import { AuthController } from './auth.controller.js';
import { LoginUseCase } from './application/use-cases/auth/login.use-case.js';
import { ClientRegisterUseCase } from './application/use-cases/client/client-register.use-case.js';
import { ForgotPasswordUseCase } from './application/use-cases/client/forgot-password.use-case.js';
import { ResetPasswordUseCase } from './application/use-cases/client/reset-password.use-case.js';
import { GetProfileUseCase } from './application/use-cases/auth/get-profile.use-case.js';
import { RefreshTokenUseCase } from './application/use-cases/auth/refresh-token.use-case.js';

describe('AuthController', () => {
  let controller: AuthController;
  let clientRegisterUseCase: { registerClient: Mock };
  let loginUseCase: { login: Mock };
  let refreshTokenUseCase: { refreshTokens: Mock };
  let forgotPasswordUseCase: { requestPasswordReset: Mock };
  let resetPasswordUseCase: { resetPassword: Mock };
  let getProfileUseCase: { getProfile: Mock };

  beforeEach(async () => {
    clientRegisterUseCase = { registerClient: vi.fn() };
    loginUseCase = { login: vi.fn() };
    refreshTokenUseCase = { refreshTokens: vi.fn() };
    forgotPasswordUseCase = { requestPasswordReset: vi.fn() };
    resetPasswordUseCase = { resetPassword: vi.fn() };
    getProfileUseCase = { getProfile: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: ClientRegisterUseCase, useValue: clientRegisterUseCase },
        { provide: LoginUseCase, useValue: loginUseCase },
        { provide: RefreshTokenUseCase, useValue: refreshTokenUseCase },
        { provide: ForgotPasswordUseCase, useValue: forgotPasswordUseCase },
        { provide: ResetPasswordUseCase, useValue: resetPasswordUseCase },
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

  it('login should call loginUseCase', async () => {
    const dto = { email: 'test@test.com', password: 'pass' };
    await controller.login(dto);
    expect(loginUseCase.login).toHaveBeenCalledWith(dto);
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
