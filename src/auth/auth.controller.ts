import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthUser } from '../shared/types/auth-user.type.js';
import { AdminLoginUseCase } from './application/use-cases/admin/admin-login.use-case.js';
import { ClientLoginUseCase } from './application/use-cases/client/client-login.use-case.js';
import { ClientRegisterUseCase } from './application/use-cases/client/client-register.use-case.js';
import { ForgotPasswordUseCase } from './application/use-cases/client/forgot-password.use-case.js';
import { ResetPasswordUseCase } from './application/use-cases/client/reset-password.use-case.js';
import { GetProfileUseCase } from './application/use-cases/auth/get-profile.use-case.js';
import { RefreshTokenUseCase } from './application/use-cases/auth/refresh-token.use-case.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { AdminLoginDto } from './dto/admin-login.dto.js';
import { ClientLoginDto } from './dto/client-login.dto.js';
import { ClientRegisterDto } from './dto/client-register.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly clientRegisterUseCase: ClientRegisterUseCase,
    private readonly clientLoginUseCase: ClientLoginUseCase,
    private readonly adminLoginUseCase: AdminLoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
  ) {}

  @Post('client/register')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiOperation({ summary: 'Register a new client' })
  @ApiCreatedResponse({ description: 'Client registered, returns token pair' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({ description: 'Email already registered' })
  clientRegister(@Body() dto: ClientRegisterDto) {
    return this.clientRegisterUseCase.registerClient(dto);
  }

  @Post('client/login')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: 'Client login' })
  @ApiCreatedResponse({ description: 'Login successful, returns token pair' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  clientLogin(@Body() dto: ClientLoginDto) {
    return this.clientLoginUseCase.loginClient(dto);
  }

  @Post('admin/login')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: 'Admin login' })
  @ApiCreatedResponse({ description: 'Login successful, returns token pair' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiForbiddenResponse({ description: 'Account is not active' })
  adminLogin(@Body() dto: AdminLoginDto) {
    return this.adminLoginUseCase.loginAdmin(dto);
  }

  @Post('refresh')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiCreatedResponse({ description: 'Tokens refreshed, returns new token pair' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Invalid or revoked refresh token' })
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.refreshTokenUseCase.refreshTokens(dto);
  }

  @Post('forgot-password')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiOkResponse({ description: 'Verification code sent if email exists' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.forgotPasswordUseCase.requestPasswordReset(dto);
  }

  @Post('reset-password')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with verification code' })
  @ApiOkResponse({ description: 'Password reset successfully' })
  @ApiBadRequestResponse({ description: 'Invalid or expired code' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.resetPasswordUseCase.resetPassword(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiOkResponse({ description: 'Returns user profile' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiNotFoundResponse({ description: 'User profile not found' })
  getProfile(@CurrentUser() user: AuthUser) {
    return this.getProfileUseCase.getProfile(user);
  }
}
