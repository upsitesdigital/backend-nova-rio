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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateAdminNotificationSettingUseCase } from './application/use-cases/create-admin-notification-setting.use-case.js';
import { DeleteAdminNotificationSettingUseCase } from './application/use-cases/delete-admin-notification-setting.use-case.js';
import { ListAdminNotificationSettingsUseCase } from './application/use-cases/list-admin-notification-settings.use-case.js';
import { UpdateAdminNotificationSettingUseCase } from './application/use-cases/update-admin-notification-setting.use-case.js';
import {
  CreateAdminNotificationSettingDto,
  UpdateAdminNotificationSettingDto,
} from './dto/create-admin-notification-setting.dto.js';

@ApiTags('Admin Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.ADMIN_MASTER)
@Controller('admin-notifications')
export class AdminNotificationsController {
  constructor(
    private listUseCase: ListAdminNotificationSettingsUseCase,
    private createUseCase: CreateAdminNotificationSettingUseCase,
    private updateUseCase: UpdateAdminNotificationSettingUseCase,
    private deleteUseCase: DeleteAdminNotificationSettingUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all notification recipients' })
  @ApiOkResponse()
  list() {
    return this.listUseCase.execute();
  }

  @Post()
  @ApiOperation({ summary: 'Add a notification recipient' })
  @ApiCreatedResponse()
  create(@Body() dto: CreateAdminNotificationSettingDto) {
    return this.createUseCase.execute(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update events for a notification recipient' })
  @ApiOkResponse()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAdminNotificationSettingDto) {
    return this.updateUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a notification recipient' })
  @ApiNoContentResponse()
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.deleteUseCase.execute(id);
  }
}
