import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { AuthUser } from '../shared/types/auth-user.type.js';
import { CreateAdminUserUseCase } from './application/use-cases/admin-user/create-admin-user.use-case.js';
import { DeleteAdminUserUseCase } from './application/use-cases/admin-user/delete-admin-user.use-case.js';
import { GetAdminUserUseCase } from './application/use-cases/admin-user/get-admin-user.use-case.js';
import { ListAdminUsersUseCase } from './application/use-cases/admin-user/list-admin-users.use-case.js';
import { UpdateAdminUserUseCase } from './application/use-cases/admin-user/update-admin-user.use-case.js';
import { CreateAdminUserDto } from './dto/admin-user/create-admin-user.dto.js';
import { ListAdminUsersQueryDto } from './dto/admin-user/list-admin-users-query.dto.js';
import { UpdateAdminUserDto } from './dto/admin-user/update-admin-user.dto.js';

@ApiTags('Admin Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.ADMIN_MASTER, AdminRole.ADMIN_BASIC)
@Controller('admin-users')
export class AdminUsersController {
  constructor(
    private readonly createAdminUserUseCase: CreateAdminUserUseCase,
    private readonly listAdminUsersUseCase: ListAdminUsersUseCase,
    private readonly getAdminUserUseCase: GetAdminUserUseCase,
    private readonly updateAdminUserUseCase: UpdateAdminUserUseCase,
    private readonly deleteAdminUserUseCase: DeleteAdminUserUseCase,
  ) {}

  @Post()
  @Roles(AdminRole.ADMIN_MASTER)
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiCreatedResponse({ description: 'Admin user created successfully' })
  @ApiConflictResponse({ description: 'Email already in use' })
  @ApiForbiddenResponse({ description: 'Only ADMIN_MASTER can create another ADMIN_MASTER' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  createAdminUser(@Body() dto: CreateAdminUserDto, @CurrentUser() user: AuthUser) {
    return this.createAdminUserUseCase.createAdminUser(dto, user.id, user.role ?? '');
  }

  @Get()
  @ApiOperation({ summary: 'List admin users with optional filters' })
  @ApiOkResponse({ description: 'Returns list of admin users' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  listAdminUsers(@Query() query: ListAdminUsersQueryDto) {
    return this.listAdminUsersUseCase.listAdminUsers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an admin user by ID' })
  @ApiOkResponse({ description: 'Returns the admin user' })
  @ApiNotFoundResponse({ description: 'Admin user not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getAdminUserById(@Param('id', ParseIntPipe) id: number) {
    return this.getAdminUserUseCase.getAdminUserById(id);
  }

  @Patch(':id')
  @Roles(AdminRole.ADMIN_MASTER)
  @ApiOperation({ summary: 'Update an admin user' })
  @ApiOkResponse({ description: 'Admin user updated successfully' })
  @ApiNotFoundResponse({ description: 'Admin user not found' })
  @ApiConflictResponse({ description: 'Email already in use' })
  @ApiForbiddenResponse({ description: 'Only ADMIN_MASTER can edit an ADMIN_MASTER' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  updateAdminUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminUserDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.updateAdminUserUseCase.updateAdminUser(id, dto, user.role ?? '');
  }

  @Delete(':id')
  @Roles(AdminRole.ADMIN_MASTER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete an admin user (set status INACTIVE)' })
  @ApiNoContentResponse({ description: 'Admin user deactivated successfully' })
  @ApiNotFoundResponse({ description: 'Admin user not found' })
  @ApiForbiddenResponse({
    description: 'Cannot deactivate your own account or ADMIN_BASIC cannot deactivate ADMIN_MASTER',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  deactivateAdminUser(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.deleteAdminUserUseCase.deactivateAdminUserById(id, user.id, user.role ?? '');
  }
}
