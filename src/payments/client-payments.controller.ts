import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
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
import { CreateClientPaymentUseCase } from './application/use-cases/payment/create-client-payment.use-case.js';
import { GetClientPaymentUseCase } from './application/use-cases/payment/get-client-payment.use-case.js';
import { ListClientPaymentsUseCase } from './application/use-cases/payment/list-client-payments.use-case.js';
import { CreatePaymentDto } from './dto/payment/create-payment.dto.js';
import { ListClientPaymentsQueryDto } from './dto/payment/list-client-payments-query.dto.js';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ClientGuard)
@Controller('payments')
export class ClientPaymentsController {
  constructor(
    private readonly createClientPaymentUseCase: CreateClientPaymentUseCase,
    private readonly listClientPaymentsUseCase: ListClientPaymentsUseCase,
    private readonly getClientPaymentUseCase: GetClientPaymentUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a payment for an appointment' })
  @ApiCreatedResponse({ description: 'Payment created successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed or duplicate payment' })
  @ApiNotFoundResponse({ description: 'Appointment or card not found' })
  @ApiForbiddenResponse({ description: 'Only clients can manage payments' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  createClientPayment(@CurrentUser() user: AuthUser, @Body() dto: CreatePaymentDto) {
    return this.createClientPaymentUseCase.createClientPayment(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List authenticated client payments' })
  @ApiOkResponse({ description: 'Returns paginated list of client payments' })
  @ApiForbiddenResponse({ description: 'Only clients can manage payments' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  listClientPayments(@CurrentUser() user: AuthUser, @Query() query: ListClientPaymentsQueryDto) {
    const clampedLimit = Math.min(query.limit ?? 20, 100);
    return this.listClientPaymentsUseCase.listPaymentsByClientId(
      user.id,
      query.page ?? 1,
      clampedLimit,
      query.status,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment by ID' })
  @ApiOkResponse({ description: 'Returns the payment' })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  @ApiForbiddenResponse({ description: 'Only clients can manage payments' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getClientPaymentById(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.getClientPaymentUseCase.getPaymentByIdAndClientId(id, user.id);
  }
}
