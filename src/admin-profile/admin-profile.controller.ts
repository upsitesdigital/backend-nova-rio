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
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { AuthUser } from '../shared/types/auth-user.type.js';
import { GetAdminProfileUseCase } from './application/use-cases/profile/get-admin-profile.use-case.js';
import { RequestAdminEmailChangeUseCase } from './application/use-cases/profile/request-admin-email-change.use-case.js';
import { RequestAdminPasswordChangeUseCase } from './application/use-cases/profile/request-admin-password-change.use-case.js';
import { UpdateAdminProfileUseCase } from './application/use-cases/profile/update-admin-profile.use-case.js';
import { VerifyAdminEmailChangeUseCase } from './application/use-cases/profile/verify-admin-email-change.use-case.js';
import { VerifyAdminPasswordChangeUseCase } from './application/use-cases/profile/verify-admin-password-change.use-case.js';
import { RequestAdminEmailChangeDto } from './dto/profile/request-admin-email-change.dto.js';
import { UpdateAdminProfileDto } from './dto/profile/update-admin-profile.dto.js';
import { VerifyAdminEmailChangeDto } from './dto/profile/verify-admin-email-change.dto.js';
import { VerifyAdminPasswordChangeDto } from './dto/profile/verify-admin-password-change.dto.js';

@ApiTags('Admin Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_MASTER', 'ADMIN_BASIC')
@Controller('admin-profile')
export class AdminProfileController {
  constructor(
    private getAdminProfileUseCase: GetAdminProfileUseCase,
    private updateAdminProfileUseCase: UpdateAdminProfileUseCase,
    private requestAdminEmailChangeUseCase: RequestAdminEmailChangeUseCase,
    private verifyAdminEmailChangeUseCase: VerifyAdminEmailChangeUseCase,
    private requestAdminPasswordChangeUseCase: RequestAdminPasswordChangeUseCase,
    private verifyAdminPasswordChangeUseCase: VerifyAdminPasswordChangeUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get own admin profile' })
  @ApiOkResponse({ description: 'Returns the admin profile' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  getProfile(@CurrentUser() user: AuthUser) {
    return this.getAdminProfileUseCase.getAdminProfile(user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update admin profile fields' })
  @ApiOkResponse({ description: 'Returns the updated profile' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  updateProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateAdminProfileDto) {
    return this.updateAdminProfileUseCase.updateAdminProfile(user.id, dto);
  }

  @Post('email/request-change')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request email change verification code' })
  @ApiOkResponse({ description: 'Verification code sent to the new email' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({ description: 'Email already in use' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  requestEmailChange(@CurrentUser() user: AuthUser, @Body() dto: RequestAdminEmailChangeDto) {
    return this.requestAdminEmailChangeUseCase.requestEmailChange(user.id, dto);
  }

  @Post('email/verify-change')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email change code and update email' })
  @ApiOkResponse({ description: 'Email updated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid or expired verification code' })
  @ApiConflictResponse({ description: 'Email already in use' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  verifyEmailChange(@CurrentUser() user: AuthUser, @Body() dto: VerifyAdminEmailChangeDto) {
    return this.verifyAdminEmailChangeUseCase.verifyEmailChange(user.id, dto);
  }

  @Post('password/request-change')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password change verification code' })
  @ApiOkResponse({ description: 'Verification code sent to your email' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  requestPasswordChange(@CurrentUser() user: AuthUser) {
    return this.requestAdminPasswordChangeUseCase.requestPasswordChange(user.id);
  }

  @Post('password/verify-change')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify password change code and update password' })
  @ApiOkResponse({ description: 'Password updated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid or expired verification code' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  verifyPasswordChange(@CurrentUser() user: AuthUser, @Body() dto: VerifyAdminPasswordChangeDto) {
    return this.verifyAdminPasswordChangeUseCase.verifyPasswordChange(user.id, dto);
  }
}
