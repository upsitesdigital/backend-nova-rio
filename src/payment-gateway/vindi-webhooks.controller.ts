import { Body, Controller, Headers, HttpCode, Post, Req } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
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
    @Headers('x-vindi-signature') signature: string,
    @Req() req: Request,
    @Body() payload: VindiWebhookPayload,
  ): Promise<{ received: true }> {
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody ?? JSON.stringify(req.body);
    await this.processVindiWebhook.processVindiWebhook(rawBody, signature, payload);
    return { received: true };
  }
}
