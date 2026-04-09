import {
  Body,
  Controller,
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
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CancelAppointmentUseCase } from './application/use-cases/appointment/cancel-appointment.use-case.js';
import { CompleteAppointmentUseCase } from './application/use-cases/appointment/complete-appointment.use-case.js';
import { CreateAppointmentUseCase } from './application/use-cases/appointment/create-appointment.use-case.js';
import { GetAppointmentUseCase } from './application/use-cases/appointment/get-appointment.use-case.js';
import { ListAppointmentsUseCase } from './application/use-cases/appointment/list-appointments.use-case.js';
import { RescheduleAppointmentUseCase } from './application/use-cases/appointment/reschedule-appointment.use-case.js';
import { UpdateAppointmentUseCase } from './application/use-cases/appointment/update-appointment.use-case.js';
import { CreateAppointmentDto } from './dto/appointment/create-appointment.dto.js';
import { ListAppointmentsQueryDto } from './dto/appointment/list-appointments-query.dto.js';
import { RescheduleAppointmentDto } from './dto/appointment/reschedule-appointment.dto.js';
import { UpdateAppointmentDto } from './dto/appointment/update-appointment.dto.js';

@ApiTags('Admin Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_MASTER', 'ADMIN_BASIC')
@Controller('admin/appointments')
export class AdminAppointmentsController {
  constructor(
    private createAppointmentUseCase: CreateAppointmentUseCase,
    private listAppointmentsUseCase: ListAppointmentsUseCase,
    private getAppointmentUseCase: GetAppointmentUseCase,
    private updateAppointmentUseCase: UpdateAppointmentUseCase,
    private rescheduleAppointmentUseCase: RescheduleAppointmentUseCase,
    private cancelAppointmentUseCase: CancelAppointmentUseCase,
    private completeAppointmentUseCase: CompleteAppointmentUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiCreatedResponse({ description: 'Appointment created successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed or scheduling conflict' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  createAppointment(@Body() dto: CreateAppointmentDto) {
    return this.createAppointmentUseCase.createAppointment(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List appointments with filters' })
  @ApiOkResponse({ description: 'Returns list of appointments' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  listAppointments(@Query() query: ListAppointmentsQueryDto) {
    return this.listAppointmentsUseCase.listAppointments(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an appointment by ID' })
  @ApiOkResponse({ description: 'Returns the appointment' })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getAppointmentById(@Param('id', ParseIntPipe) id: number) {
    return this.getAppointmentUseCase.getAppointmentById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an appointment' })
  @ApiOkResponse({ description: 'Appointment updated successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed or scheduling conflict' })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  updateAppointmentById(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAppointmentDto) {
    return this.updateAppointmentUseCase.updateAppointmentById(id, dto);
  }

  @Post(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule an appointment' })
  @ApiCreatedResponse({ description: 'Appointment rescheduled successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed or scheduling conflict' })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  rescheduleAppointmentById(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RescheduleAppointmentDto,
  ) {
    return this.rescheduleAppointmentUseCase.rescheduleAppointmentById(id, dto);
  }

  @Patch(':id/cancel')
  @Roles('ADMIN_MASTER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel an appointment' })
  @ApiNoContentResponse({ description: 'Appointment cancelled successfully' })
  @ApiBadRequestResponse({ description: 'Appointment cannot be cancelled' })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  cancelAppointmentById(@Param('id', ParseIntPipe) id: number) {
    return this.cancelAppointmentUseCase.cancelAppointmentById(id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark an appointment as completed' })
  @ApiOkResponse({ description: 'Appointment completed successfully' })
  @ApiBadRequestResponse({ description: 'Appointment cannot be completed' })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  completeAppointmentById(@Param('id', ParseIntPipe) id: number) {
    return this.completeAppointmentUseCase.completeAppointmentById(id);
  }
}
