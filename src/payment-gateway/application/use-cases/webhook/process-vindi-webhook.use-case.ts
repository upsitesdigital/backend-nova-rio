import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { IProcessedWebhookEventRepository } from '../../../domain/interfaces/processed-webhook-event.repository.interface.js';
import type { IWebhookAuthenticator } from '../../../domain/interfaces/webhook-authenticator.interface.js';
import { VindiWebhookEventType } from '../../../domain/types/vindi.types.js';
import type {
  VindiWebhookBillData,
  VindiWebhookChargeData,
  VindiWebhookPayload,
} from '../../../domain/types/vindi.types.js';
import { HandleVindiBillPaidUseCase } from './handle-vindi-bill-paid.use-case.js';
import { HandleVindiChargeRejectedUseCase } from './handle-vindi-charge-rejected.use-case.js';

@Injectable()
export class ProcessVindiWebhookUseCase {
  private readonly provider = 'vindi';
  private readonly logger = new Logger(ProcessVindiWebhookUseCase.name);

  constructor(
    @Inject(DiTokens.webhookAuthenticator)
    private readonly authenticator: IWebhookAuthenticator,
    @Inject(DiTokens.processedWebhookEventRepository)
    private readonly processedEventRepository: IProcessedWebhookEventRepository,
    private readonly handleBillPaid: HandleVindiBillPaidUseCase,
    private readonly handleChargeRejected: HandleVindiChargeRejectedUseCase,
  ) {}

  async processVindiWebhook(
    authorizationHeader: string | undefined,
    payload: VindiWebhookPayload,
  ): Promise<void> {
    if (!this.authenticator.authenticate(authorizationHeader)) {
      throw new UnauthorizedException('Invalid webhook credentials');
    }

    const eventType = payload?.event?.type;
    this.logger.log(`Received Vindi webhook: ${eventType}`);

    const eventId = this.getEventId(payload);
    const isNew = await this.processedEventRepository.registerEventOnce(eventId, this.provider);

    if (!isNew) {
      this.logger.log(`Duplicate Vindi webhook skipped: ${eventId}`);
      return;
    }

    await this.routeEvent(eventType, payload);
  }

  private async routeEvent(eventType: string, payload: VindiWebhookPayload): Promise<void> {
    switch (eventType) {
      case VindiWebhookEventType.billPaid: {
        const data = payload.event.data as VindiWebhookBillData;
        await this.handleBillPaid.handleBillPaid(data.bill.id);
        return;
      }
      case VindiWebhookEventType.chargeRejected: {
        const data = payload.event.data as VindiWebhookChargeData;
        const reason = data.charge.last_transaction?.gateway_message ?? 'Charge rejected';
        await this.handleChargeRejected.handleChargeRejected(data.charge.bill.id, reason);
        return;
      }
      case VindiWebhookEventType.billCanceled: {
        const data = payload.event.data as VindiWebhookBillData;
        await this.handleChargeRejected.handleChargeRejected(
          data.bill.id,
          'Bill cancelled by gateway',
        );
        return;
      }
      default:
        this.logger.log(`Unhandled Vindi event type: ${eventType}`);
    }
  }

  private getEventId(payload: VindiWebhookPayload): string {
    const rawEvent = payload.event as VindiWebhookPayload['event'] & { id?: string | number };
    if (rawEvent.id !== undefined && rawEvent.id !== null) {
      return String(rawEvent.id);
    }

    return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  }
}
