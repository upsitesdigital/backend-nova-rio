import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'node:crypto';
import type { IWebhookAuthenticator } from '../../domain/interfaces/webhook-authenticator.interface.js';

@Injectable()
export class VindiBasicAuthenticator implements IWebhookAuthenticator {
  private readonly expectedHeader: string;

  constructor(configService: ConfigService) {
    const user = configService.getOrThrow<string>('VINDI_WEBHOOK_USER');
    const password = configService.getOrThrow<string>('VINDI_WEBHOOK_PASSWORD');
    this.expectedHeader = `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`;
  }

  authenticate(authorizationHeader: string | undefined): boolean {
    if (!authorizationHeader) {
      return false;
    }

    const received = Buffer.from(authorizationHeader, 'utf-8');
    const expected = Buffer.from(this.expectedHeader, 'utf-8');

    if (received.length !== expected.length) {
      return false;
    }

    return timingSafeEqual(received, expected);
  }
}
