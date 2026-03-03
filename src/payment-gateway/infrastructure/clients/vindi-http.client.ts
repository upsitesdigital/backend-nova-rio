import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface VindiRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
}

@Injectable()
export class VindiHttpClient {
  private readonly logger = new Logger(VindiHttpClient.name);
  private readonly apiUrl: string;
  private readonly authHeader: string;

  constructor(configService: ConfigService) {
    const apiKey = configService.getOrThrow<string>('VINDI_API_KEY');
    this.apiUrl = configService.getOrThrow<string>('VINDI_API_URL');
    this.authHeader = `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`;
  }

  async sendRequest<T>(path: string, options: VindiRequestOptions): Promise<T> {
    const url = `${this.apiUrl}${path}`;

    this.logger.log(`${options.method} ${path}`);

    const response = await fetch(url, {
      method: options.method,
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: AbortSignal.timeout(15_000),
    });

    if (options.method === 'DELETE' && response.status === 204) {
      return undefined as T;
    }

    const data: unknown = await response.json();

    if (!response.ok) {
      this.logger.error(
        `Vindi API error: ${response.status} ${options.method} ${path}`,
        JSON.stringify(data),
      );
      throw new Error(`Vindi API error: ${response.status} — ${JSON.stringify(data)}`);
    }

    return data as T;
  }
}
