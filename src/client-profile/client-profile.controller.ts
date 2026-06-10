import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ClientGuard } from '../auth/guards/client.guard.js';
import type { AuthUser } from '../shared/types/auth-user.type.js';
import { DeleteClientAccountUseCase } from './application/use-cases/profile/delete-client-account.use-case.js';
import { GetClientProfileUseCase } from './application/use-cases/profile/get-client-profile.use-case.js';
import { RequestEmailChangeUseCase } from './application/use-cases/profile/request-email-change.use-case.js';
import { RequestPasswordChangeUseCase } from './application/use-cases/profile/request-password-change.use-case.js';
import { UpdateClientProfileUseCase } from './application/use-cases/profile/update-client-profile.use-case.js';
import { VerifyEmailChangeUseCase } from './application/use-cases/profile/verify-email-change.use-case.js';
import { VerifyPasswordChangeUseCase } from './application/use-cases/profile/verify-password-change.use-case.js';
import { DeleteAccountDto } from './dto/profile/delete-account.dto.js';
import { RequestEmailChangeDto } from './dto/profile/request-email-change.dto.js';
import { UpdateProfileDto } from './dto/profile/update-profile.dto.js';
import { VerifyEmailChangeDto } from './dto/profile/verify-email-change.dto.js';
import { VerifyPasswordChangeDto } from './dto/profile/verify-password-change.dto.js';

@ApiTags('Client Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ClientGuard)
@Controller('clients/profile')
export class ClientProfileController {
  constructor(
    private getClientProfileUseCase: GetClientProfileUseCase,
    private updateClientProfileUseCase: UpdateClientProfileUseCase,
    private requestEmailChangeUseCase: RequestEmailChangeUseCase,
    private verifyEmailChangeUseCase: VerifyEmailChangeUseCase,
    private requestPasswordChangeUseCase: RequestPasswordChangeUseCase,
    private verifyPasswordChangeUseCase: VerifyPasswordChangeUseCase,
    private deleteClientAccountUseCase: DeleteClientAccountUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get own profile' })
  @ApiOkResponse({ description: 'Returns the client profile' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiNotFoundResponse({ description: 'Client not found' })
  getProfile(@CurrentUser() user: AuthUser) {
    return this.getClientProfileUseCase.getClientProfile(user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update profile fields' })
  @ApiOkResponse({ description: 'Returns the updated profile' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiNotFoundResponse({ description: 'Client not found' })
  updateProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.updateClientProfileUseCase.updateClientProfile(user.id, dto);
  }

  @Post('email/request-change')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request email change verification code' })
  @ApiOkResponse({ description: 'Verification code sent to the new email' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({ description: 'Email already in use' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiNotFoundResponse({ description: 'Client not found' })
  requestEmailChange(@CurrentUser() user: AuthUser, @Body() dto: RequestEmailChangeDto) {
    return this.requestEmailChangeUseCase.requestEmailChange(user.id, dto);
  }

  @Post('email/verify-change')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email change code and update email' })
  @ApiOkResponse({ description: 'Email updated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid or expired verification code' })
  @ApiConflictResponse({ description: 'Email already in use' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiNotFoundResponse({ description: 'Client not found' })
  verifyEmailChange(@CurrentUser() user: AuthUser, @Body() dto: VerifyEmailChangeDto) {
    return this.verifyEmailChangeUseCase.verifyEmailChange(user.id, dto);
  }

  @Post('password/request-change')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password change verification code' })
  @ApiOkResponse({ description: 'Verification code sent to your email' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiNotFoundResponse({ description: 'Client not found' })
  requestPasswordChange(@CurrentUser() user: AuthUser) {
    return this.requestPasswordChangeUseCase.requestPasswordChange(user.id);
  }

  @Post('password/verify-change')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify password change code and update password' })
  @ApiOkResponse({ description: 'Password updated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid or expired verification code' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiNotFoundResponse({ description: 'Client not found' })
  verifyPasswordChange(@CurrentUser() user: AuthUser, @Body() dto: VerifyPasswordChangeDto) {
    return this.verifyPasswordChangeUseCase.verifyPasswordChange(user.id, dto);
  }

  @Post('delete-account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete own account (soft delete)' })
  @ApiOkResponse({ description: 'Account deleted successfully' })
  @ApiBadRequestResponse({ description: 'Invalid confirmation phrase' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiNotFoundResponse({ description: 'Client not found' })
  deleteAccount(@CurrentUser() user: AuthUser, @Body() _dto: DeleteAccountDto) {
    return this.deleteClientAccountUseCase.deleteClientAccount(user.id);
  }
}
