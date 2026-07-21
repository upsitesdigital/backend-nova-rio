import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';

@Injectable()
export class PaymentTokenService {
  private static readonly ttl = '1h';
  private static readonly tokenType = 'public_payment';
  private readonly secret: string;

  constructor(configService: ConfigService) {
    this.secret = configService.getOrThrow<string>('JWT_SECRET');
  }

  issuePaymentToken(appointmentId: number): string {
    return jwt.sign({ appointmentId, type: PaymentTokenService.tokenType }, this.secret, {
      expiresIn: PaymentTokenService.ttl,
    });
  }

  verifyPaymentToken(token: string): number | null {
    try {
      const payload = jwt.verify(token, this.secret) as {
        appointmentId?: number;
        type?: string;
      };

      if (payload.type !== PaymentTokenService.tokenType) {
        return null;
      }

      if (typeof payload.appointmentId !== 'number') {
        return null;
      }

      return payload.appointmentId;
    } catch {
      return null;
    }
  }
}
