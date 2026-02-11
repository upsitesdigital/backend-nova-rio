import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import type { AuthUser } from '../shared/types/auth-user.type.js';
import { AdminLoginUseCase } from './application/use-cases/admin-login.use-case.js';
import { ClientLoginUseCase } from './application/use-cases/client-login.use-case.js';
import { ClientRegisterUseCase } from './application/use-cases/client-register.use-case.js';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case.js';
import { GetProfileUseCase } from './application/use-cases/get-profile.use-case.js';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { AdminLoginDto } from './dto/admin-login.dto.js';
import { ClientLoginDto } from './dto/client-login.dto.js';
import { ClientRegisterDto } from './dto/client-register.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(
    private clientRegisterUseCase: ClientRegisterUseCase,
    private clientLoginUseCase: ClientLoginUseCase,
    private adminLoginUseCase: AdminLoginUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase,
    private forgotPasswordUseCase: ForgotPasswordUseCase,
    private getProfileUseCase: GetProfileUseCase,
  ) {}

  @Post('client/register')
  clientRegister(@Body() dto: ClientRegisterDto) {
    return this.clientRegisterUseCase.execute(dto);
  }

  @Post('client/login')
  clientLogin(@Body() dto: ClientLoginDto) {
    return this.clientLoginUseCase.execute(dto);
  }

  @Post('admin/login')
  adminLogin(@Body() dto: AdminLoginDto) {
    return this.adminLoginUseCase.execute(dto);
  }

  @Post('refresh')
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.refreshTokenUseCase.execute(dto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.forgotPasswordUseCase.execute(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: AuthUser) {
    return this.getProfileUseCase.execute(user);
  }
}
