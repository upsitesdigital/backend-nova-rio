import {
  Controller,
  Get,
  Header,
  Param,
  ParseIntPipe,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { createReadStream } from 'node:fs';
import { join } from 'node:path';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { ClientGuard } from '../auth/guards/client.guard.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { AuthUser } from '../shared/types/auth-user.type.js';
import { GetClientReceiptUseCase } from './application/use-cases/receipt/get-client-receipt.use-case.js';
import { GetReceiptUseCase } from './application/use-cases/receipt/get-receipt.use-case.js';

@ApiTags('Receipts')
@ApiBearerAuth()
@Controller()
export class ReceiptsController {
  constructor(
    private getReceiptUseCase: GetReceiptUseCase,
    private getClientReceiptUseCase: GetClientReceiptUseCase,
  ) {}

  @Get('clients/payments/:id/receipt')
  @UseGuards(JwtAuthGuard, ClientGuard)
  @ApiOperation({ summary: 'Download receipt for a client payment' })
  @ApiProduces('application/pdf')
  @ApiOkResponse({ description: 'PDF receipt file' })
  @ApiNotFoundResponse({ description: 'Payment or receipt not found' })
  @ApiForbiddenResponse({ description: 'Only clients can access this resource' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @Header('Content-Type', 'application/pdf')
  async downloadClientReceipt(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StreamableFile> {
    const receipt = await this.getClientReceiptUseCase.getReceiptByPaymentIdAndClientId(
      id,
      user.id,
    );
    const filePath = join(process.cwd(), 'uploads', receipt.fileUrl);
    const stream = createReadStream(filePath);
    return new StreamableFile(stream, {
      type: 'application/pdf',
      disposition: `attachment; filename="receipt-${receipt.paymentId}.pdf"`,
    });
  }

  @Get('admin/payments/:id/receipt')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MASTER', 'ADMIN_BASIC')
  @ApiOperation({ summary: 'Download receipt for any payment (admin)' })
  @ApiProduces('application/pdf')
  @ApiOkResponse({ description: 'PDF receipt file' })
  @ApiNotFoundResponse({ description: 'Receipt not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @Header('Content-Type', 'application/pdf')
  async downloadAdminReceipt(@Param('id', ParseIntPipe) id: number): Promise<StreamableFile> {
    const receipt = await this.getReceiptUseCase.getReceiptByPaymentId(id);
    const filePath = join(process.cwd(), 'uploads', receipt.fileUrl);
    const stream = createReadStream(filePath);
    return new StreamableFile(stream, {
      type: 'application/pdf',
      disposition: `attachment; filename="receipt-${receipt.paymentId}.pdf"`,
    });
  }
}
