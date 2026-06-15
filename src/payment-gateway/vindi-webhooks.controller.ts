import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ProcessVindiWebhookUseCase } from './application/use-cases/webhook/process-vindi-webhook.use-case.js';
import type { VindiWebhookPayload } from './domain/types/vindi.types.js';

@ApiExcludeController()
@Throttle({ default: { limit: 60, ttl: 60000 } })
@Controller('webhooks/vindi')
export class VindiWebhooksController {
  constructor(private readonly processVindiWebhook: ProcessVindiWebhookUseCase) {}

  @Post()
  @HttpCode(200)
  async receiveVindiWebhook(
    @Headers('authorization') authorization: string | undefined,
    @Body() payload: VindiWebhookPayload,
  ): Promise<{ received: true }> {
    await this.processVindiWebhook.processVindiWebhook(authorization, payload);
    return { received: true };
  }
}
