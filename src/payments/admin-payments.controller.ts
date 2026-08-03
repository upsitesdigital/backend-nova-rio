import { Controller, Get, Param, ParseIntPipe, Patch, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ApprovePaymentUseCase } from './application/use-cases/payment/approve-payment.use-case.js';
import { CancelPaymentUseCase } from './application/use-cases/payment/cancel-payment.use-case.js';
import { GetPaymentUseCase } from './application/use-cases/payment/get-payment.use-case.js';
import { ListPaymentsUseCase } from './application/use-cases/payment/list-payments.use-case.js';
import { ListPaymentsQueryDto } from './dto/payment/list-payments-query.dto.js';

@ApiTags('Admin Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_MASTER', 'ADMIN_BASIC')
@Controller('admin/payments')
export class AdminPaymentsController {
  constructor(
    private listPaymentsUseCase: ListPaymentsUseCase,
    private getPaymentUseCase: GetPaymentUseCase,
    private approvePaymentUseCase: ApprovePaymentUseCase,
    private cancelPaymentUseCase: CancelPaymentUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List payments with filters' })
  @ApiOkResponse({ description: 'Returns list of payments' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  listPayments(@Query() query: ListPaymentsQueryDto) {
    return this.listPaymentsUseCase.listPayments(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment by ID' })
  @ApiOkResponse({ description: 'Returns the payment' })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getPaymentById(@Param('id', ParseIntPipe) id: number) {
    return this.getPaymentUseCase.getPaymentById(id);
  }

  @Patch(':id/approve')
  @Roles('ADMIN_MASTER')
  @ApiOperation({ summary: 'Approve a pending payment' })
  @ApiOkResponse({ description: 'Payment approved successfully' })
  @ApiBadRequestResponse({ description: 'Payment is not pending' })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  approvePaymentById(@Param('id', ParseIntPipe) id: number) {
    return this.approvePaymentUseCase.approvePaymentById(id);
  }

  @Patch(':id/cancel')
  @Roles('ADMIN_MASTER')
  @ApiOperation({ summary: 'Cancel a pending payment and its gateway bill' })
  @ApiOkResponse({ description: 'Payment cancelled successfully' })
  @ApiBadRequestResponse({ description: 'Payment is not pending' })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  cancelPaymentById(@Param('id', ParseIntPipe) id: number) {
    return this.cancelPaymentUseCase.cancelPaymentById(id);
  }
}
