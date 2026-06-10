import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { IWebhookSignatureVerifier } from '../../domain/interfaces/webhook-signature-verifier.interface.js';

@Injectable()
export class VindiSignatureVerifier implements IWebhookSignatureVerifier {
  constructor(private readonly configService: ConfigService) {}

  verifySignature(rawBody: Buffer | string, signature: string | undefined): boolean {
    const expected = this.hash(rawBody);
    const received = Buffer.from(signature ?? '', 'utf-8');
    const expectedBuf = Buffer.from(expected, 'utf-8');

    if (received.length !== expectedBuf.length) {
      return false;
    }

    return timingSafeEqual(received, expectedBuf);
  }

  computePayloadHash(payload: unknown): string {
    return this.hash(JSON.stringify(payload));
  }

  private hash(data: Buffer | string): string {
    const secret = this.configService.getOrThrow<string>('VINDI_WEBHOOK_SECRET');
    return createHmac('sha256', secret).update(data).digest('hex');
  }
}
