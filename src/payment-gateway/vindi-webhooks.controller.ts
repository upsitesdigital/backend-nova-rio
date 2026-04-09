import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import type {
  VindiWebhookBillData,
  VindiWebhookChargeData,
  VindiWebhookPayload,
} from './domain/types/vindi.types.js';
import { HandleVindiBillPaidUseCase } from './application/use-cases/webhook/handle-vindi-bill-paid.use-case.js';
import { HandleVindiChargeRejectedUseCase } from './application/use-cases/webhook/handle-vindi-charge-rejected.use-case.js';

@ApiExcludeController()
@SkipThrottle()
@Controller('webhooks/vindi')
export class VindiWebhooksController {
  private readonly logger = new Logger(VindiWebhooksController.name);

  constructor(
    private readonly handleBillPaid: HandleVindiBillPaidUseCase,
    private readonly handleChargeRejected: HandleVindiChargeRejectedUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @HttpCode(200)
  async receiveVindiWebhook(
    @Headers('x-vindi-signature') signature: string,
    @Req() req: Request,
    @Body() payload: VindiWebhookPayload,
  ): Promise<{ received: true }> {
    this.verifyWebhookSignature(signature, req);

    const eventType = payload?.event?.type;
    this.logger.log(`Received Vindi webhook: ${eventType}`);

    try {
      switch (eventType) {
        case 'bill_paid': {
          const data = payload.event.data as VindiWebhookBillData;
          await this.handleBillPaid.handleBillPaid(data.bill.id);
          break;
        }
        case 'charge_rejected': {
          const data = payload.event.data as VindiWebhookChargeData;
          const reason = data.charge.last_transaction?.gateway_message ?? 'Charge rejected';
          await this.handleChargeRejected.handleChargeRejected(data.charge.bill.id, reason);
          break;
        }
        case 'bill_canceled': {
          const data = payload.event.data as VindiWebhookBillData;
          await this.handleChargeRejected.handleChargeRejected(
            data.bill.id,
            'Bill cancelled by gateway',
          );
          break;
        }
        default:
          this.logger.log(`Unhandled Vindi event type: ${eventType}`);
      }
    } catch (error) {
      this.logger.error(`Error processing Vindi webhook ${eventType}`, error);
      throw error;
    }

    return { received: true };
  }

  private verifyWebhookSignature(signature: string | undefined, req: Request): void {
    const webhookSecret = this.configService.getOrThrow<string>('VINDI_WEBHOOK_SECRET');
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
    const bodyToHash = rawBody ?? JSON.stringify(req.body);
    const expected = createHmac('sha256', webhookSecret).update(bodyToHash).digest('hex');
    const received = Buffer.from(signature ?? '', 'utf-8');
    const expectedBuf = Buffer.from(expected, 'utf-8');

    if (received.length !== expectedBuf.length || !timingSafeEqual(received, expectedBuf)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
  }
}
