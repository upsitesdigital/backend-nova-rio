import {
  Body,
  Controller,
  DefaultValuePipe,
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
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { ClientGuard } from '../auth/guards/client.guard.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthUser } from '../shared/types/auth-user.type.js';
import { CancelClientAppointmentUseCase } from './application/use-cases/appointment/cancel-client-appointment.use-case.js';
import { CreateClientAppointmentUseCase } from './application/use-cases/appointment/create-client-appointment.use-case.js';
import { GetClientAppointmentUseCase } from './application/use-cases/appointment/get-client-appointment.use-case.js';
import { ListClientAppointmentsUseCase } from './application/use-cases/appointment/list-client-appointments.use-case.js';
import { RescheduleClientAppointmentUseCase } from './application/use-cases/appointment/reschedule-client-appointment.use-case.js';
import { CreateClientAppointmentDto } from './dto/appointment/create-client-appointment.dto.js';
import { RescheduleAppointmentDto } from './dto/appointment/reschedule-appointment.dto.js';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ClientGuard)
@Controller('appointments')
export class ClientAppointmentsController {
  constructor(
    private createClientAppointmentUseCase: CreateClientAppointmentUseCase,
    private listClientAppointmentsUseCase: ListClientAppointmentsUseCase,
    private getClientAppointmentUseCase: GetClientAppointmentUseCase,
    private rescheduleClientAppointmentUseCase: RescheduleClientAppointmentUseCase,
    private cancelClientAppointmentUseCase: CancelClientAppointmentUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiCreatedResponse({ description: 'Appointment created successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed or scheduling conflict' })
  @ApiForbiddenResponse({ description: 'Only clients can manage appointments' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  createClientAppointment(@CurrentUser() user: AuthUser, @Body() dto: CreateClientAppointmentDto) {
    return this.createClientAppointmentUseCase.createClientAppointment(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List authenticated client appointments' })
  @ApiOkResponse({ description: 'Returns paginated list of client appointments' })
  @ApiForbiddenResponse({ description: 'Only clients can manage appointments' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  listClientAppointments(
    @CurrentUser() user: AuthUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const clampedLimit = Math.min(limit, 100);
    return this.listClientAppointmentsUseCase.listAppointmentsByClientId(
      user.id,
      page,
      clampedLimit,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an appointment by ID' })
  @ApiOkResponse({ description: 'Returns the appointment' })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  @ApiForbiddenResponse({ description: 'Only clients can manage appointments' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getClientAppointmentById(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.getClientAppointmentUseCase.getAppointmentByIdAndClientId(id, user.id);
  }

  @Post(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule an appointment' })
  @ApiCreatedResponse({ description: 'Appointment rescheduled successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed or scheduling conflict' })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  @ApiForbiddenResponse({ description: 'Only clients can manage appointments' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  rescheduleClientAppointmentById(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RescheduleAppointmentDto,
  ) {
    return this.rescheduleClientAppointmentUseCase.rescheduleAppointmentByIdAndClientId(
      id,
      user.id,
      dto,
    );
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel an appointment' })
  @ApiNoContentResponse({ description: 'Appointment cancelled successfully' })
  @ApiBadRequestResponse({ description: 'Appointment cannot be cancelled' })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  @ApiForbiddenResponse({ description: 'Only clients can manage appointments' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  cancelClientAppointmentById(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cancelClientAppointmentUseCase.cancelAppointmentByIdAndClientId(id, user.id);
  }
}
