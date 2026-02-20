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
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateHolidayUseCase } from './application/use-cases/holiday/create-holiday.use-case.js';
import { DeleteHolidayUseCase } from './application/use-cases/holiday/delete-holiday.use-case.js';
import { GetHolidayUseCase } from './application/use-cases/holiday/get-holiday.use-case.js';
import { ListHolidaysUseCase } from './application/use-cases/holiday/list-holidays.use-case.js';
import { SyncHolidaysUseCase } from './application/use-cases/holiday/sync-holidays.use-case.js';
import { UpdateHolidayUseCase } from './application/use-cases/holiday/update-holiday.use-case.js';
import { CreateHolidayDto } from './dto/holiday/create-holiday.dto.js';
import { SyncHolidaysDto } from './dto/holiday/sync-holidays.dto.js';
import { UpdateHolidayDto } from './dto/holiday/update-holiday.dto.js';

@ApiTags('Holidays')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_MASTER', 'ADMIN_BASIC')
@Controller('holidays')
export class HolidaysController {
  constructor(
    private syncHolidaysUseCase: SyncHolidaysUseCase,
    private listHolidaysUseCase: ListHolidaysUseCase,
    private createHolidayUseCase: CreateHolidayUseCase,
    private getHolidayUseCase: GetHolidayUseCase,
    private updateHolidayUseCase: UpdateHolidayUseCase,
    private deleteHolidayUseCase: DeleteHolidayUseCase,
  ) {}

  @Post('sync')
  @ApiOperation({ summary: 'Sync holidays from BrasilAPI for a given year' })
  @ApiOkResponse({ description: 'Holidays synced successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  syncHolidays(@Body() dto: SyncHolidaysDto) {
    return this.syncHolidaysUseCase.syncHolidaysByYear(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List holidays, optionally filtered by year' })
  @ApiQuery({ name: 'year', required: false, type: Number, example: 2026 })
  @ApiOkResponse({ description: 'Returns list of holidays' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  listHolidays(@Query('year') year?: string) {
    return this.listHolidaysUseCase.listHolidays(year ? parseInt(year, 10) : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a holiday by ID' })
  @ApiOkResponse({ description: 'Returns the holiday' })
  @ApiNotFoundResponse({ description: 'Holiday not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getHolidayById(@Param('id', ParseIntPipe) id: number) {
    return this.getHolidayUseCase.getHolidayById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a holiday manually' })
  @ApiCreatedResponse({ description: 'Holiday created successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({ description: 'Holiday already exists on this date' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  createHoliday(@Body() dto: CreateHolidayDto) {
    return this.createHolidayUseCase.createHoliday(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a holiday' })
  @ApiOkResponse({ description: 'Holiday updated successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Holiday not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  updateHoliday(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateHolidayDto) {
    return this.updateHolidayUseCase.updateHolidayById(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a holiday' })
  @ApiNoContentResponse({ description: 'Holiday deleted successfully' })
  @ApiNotFoundResponse({ description: 'Holiday not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  deleteHoliday(@Param('id', ParseIntPipe) id: number) {
    return this.deleteHolidayUseCase.deleteHolidayById(id);
  }
}
