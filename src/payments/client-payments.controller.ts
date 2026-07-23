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
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { ClientGuard } from '../auth/guards/client.guard.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthUser } from '../shared/types/auth-user.type.js';
import { CreateClientPaymentUseCase } from './application/use-cases/payment/create-client-payment.use-case.js';
import { CreatePublicCheckoutUseCase } from './application/use-cases/payment/create-public-checkout.use-case.js';
import { GetClientPaymentUseCase } from './application/use-cases/payment/get-client-payment.use-case.js';
import { ListClientPaymentsUseCase } from './application/use-cases/payment/list-client-payments.use-case.js';
import { CreatePaymentDto } from './dto/payment/create-payment.dto.js';
import { CreatePublicCheckoutDto } from './dto/payment/create-public-checkout.dto.js';
import { ListClientPaymentsQueryDto } from './dto/payment/list-client-payments-query.dto.js';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class ClientPaymentsController {
  constructor(
    private readonly createClientPaymentUseCase: CreateClientPaymentUseCase,
    private readonly createPublicCheckoutUseCase: CreatePublicCheckoutUseCase,
    private readonly listClientPaymentsUseCase: ListClientPaymentsUseCase,
    private readonly getClientPaymentUseCase: GetClientPaymentUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, ClientGuard)
  @ApiOperation({ summary: 'Create a payment for an appointment' })
  @ApiCreatedResponse({ description: 'Payment created successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed or duplicate payment' })
  @ApiNotFoundResponse({ description: 'Appointment or card not found' })
  @ApiForbiddenResponse({ description: 'Only clients can manage payments' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  createClientPayment(@CurrentUser() user: AuthUser, @Body() dto: CreatePaymentDto) {
    return this.createClientPaymentUseCase.createClientPayment(user.id, dto);
  }

  @Post('public/checkout')
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @ApiOperation({ summary: 'Create an appointment and charge it in one atomic request' })
  @ApiCreatedResponse({ description: 'Appointment scheduled and payment created' })
  @ApiBadRequestResponse({
    description: 'Validation failed, declined payment, or scheduling conflict',
  })
  @ApiNotFoundResponse({ description: 'Client not found' })
  createPublicCheckout(@Body() dto: CreatePublicCheckoutDto) {
    return this.createPublicCheckoutUseCase.createPublicCheckout(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, ClientGuard)
  @ApiOperation({ summary: 'List authenticated client payments' })
  @ApiOkResponse({ description: 'Returns paginated list of client payments' })
  @ApiForbiddenResponse({ description: 'Only clients can manage payments' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  listClientPayments(@CurrentUser() user: AuthUser, @Query() query: ListClientPaymentsQueryDto) {
    const clampedLimit = Math.min(query.limit, 100);
    return this.listClientPaymentsUseCase.listPaymentsByClientId(
      user.id,
      query.page,
      clampedLimit,
      query.status,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, ClientGuard)
  @ApiOperation({ summary: 'Get a payment by ID' })
  @ApiOkResponse({ description: 'Returns the payment' })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  @ApiForbiddenResponse({ description: 'Only clients can manage payments' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getClientPaymentById(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.getClientPaymentUseCase.getPaymentByIdAndClientId(id, user.id);
  }
}
