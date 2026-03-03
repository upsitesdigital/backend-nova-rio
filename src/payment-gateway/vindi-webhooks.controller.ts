import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
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
  ) {}

  @Post()
  @HttpCode(200)
  async receiveVindiWebhook(@Body() payload: VindiWebhookPayload): Promise<{ received: true }> {
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
    }

    return { received: true };
  }
}
